import { Router } from 'express';
import Service from '../models/Service.js';
import ServiceOrder from '../models/ServiceOrder.js';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, q, sort, owner, minPrice, maxPrice } = req.query;
    const filter = { isActive: true };
    if (owner) filter.owner = owner;
    if (category) filter.category = category;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
    if (minPrice) filter.price = { $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    let query = Service.find(filter).populate('owner', 'firstName lastName avatar rating');
    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else if (sort === 'rating') query = query.sort({ rating: -1 });
    else query = query.sort({ createdAt: -1 });
    res.json(await query);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const services = await Service.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('owner', 'firstName lastName avatar rating reviewCount bio skills');
    if (!service) return res.status(404).json({ error: 'Hizmet bulunamadı' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, owner: req.user.id });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Bulunamadı' });
    if (service.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    Object.assign(service, req.body);
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Bulunamadı' });
    if (service.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    await service.deleteOne();
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/purchase', verifyToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('owner');
    if (!service) return res.status(404).json({ error: 'Bulunamadı' });
    const sellerId = service.owner._id.toString();
    if (sellerId === req.user.id)
      return res.status(400).json({ error: 'Kendi hizmetinizi satın alamazsınız' });
    await ServiceOrder.create({
      buyer: req.user.id,
      seller: sellerId,
      service: service._id,
      amount: service.price,
      status: 'completed',
    });
    service.purchaseCount += 1;
    await service.save();
    await Notification.create({
      user: service.owner._id,
      type: 'purchase',
      title: 'Hizmetiniz satın alındı',
      body: `"${service.title}" hizmetiniz yeni bir müşteri tarafından satın alındı.`,
      link: `/detail/service/${service._id}`,
    });
    res.status(201).json({ message: 'Satın alma başarılı', serviceId: service._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
