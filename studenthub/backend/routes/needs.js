import { Router } from 'express';
import Need from '../models/Need.js';
import Offer from '../models/Offer.js';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = { status: 'open' };
    if (category) filter.category = category;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
    const needs = await Need.find(filter).populate('owner', 'firstName lastName avatar').sort({ createdAt: -1 });
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const need = await Need.findById(req.params.id).populate('owner', 'firstName lastName avatar rating');
    if (!need) return res.status(404).json({ error: 'Bulunamadı' });
    const offers = await Offer.find({ need: req.params.id }).populate('offerer', 'firstName lastName avatar rating');
    res.json({ ...need.toObject(), offers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const need = await Need.create({ ...req.body, owner: req.user.id });
    res.status(201).json(need);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const need = await Need.findById(req.params.id);
    if (!need) return res.status(404).json({ error: 'Bulunamadı' });
    if (need.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    Object.assign(need, req.body);
    await need.save();
    res.json(need);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const need = await Need.findById(req.params.id);
    if (!need) return res.status(404).json({ error: 'Bulunamadı' });
    if (need.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    await need.deleteOne();
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/offers', verifyToken, async (req, res) => {
  try {
    const need = await Need.findById(req.params.id).populate('owner');
    if (!need) return res.status(404).json({ error: 'Bulunamadı' });
    const offer = await Offer.create({ ...req.body, need: req.params.id, offerer: req.user.id });
    await Notification.create({
      user: need.owner._id,
      type: 'offer',
      title: 'Yeni teklif aldınız',
      body: `"${need.title}" ilanınıza yeni bir teklif geldi.`,
      link: `/detail/need/${need._id}`,
    });
    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:needId/offers/:offerId/accept', verifyToken, async (req, res) => {
  try {
    const need = await Need.findById(req.params.needId);
    if (!need || need.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    const offer = await Offer.findByIdAndUpdate(req.params.offerId, { status: 'accepted' }, { new: true }).populate('offerer');
    await Need.findByIdAndUpdate(req.params.needId, { status: 'in_progress' });
    await Offer.updateMany({ need: req.params.needId, _id: { $ne: req.params.offerId } }, { status: 'rejected' });
    await Notification.create({
      user: offer.offerer._id,
      type: 'offer',
      title: 'Teklifiniz kabul edildi!',
      body: `"${need.title}" ilanı için teklifiniz kabul edildi.`,
      link: `/detail/need/${need._id}`,
    });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:needId/offers/:offerId/reject', verifyToken, async (req, res) => {
  try {
    const need = await Need.findById(req.params.needId);
    if (!need || need.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    const offer = await Offer.findByIdAndUpdate(req.params.offerId, { status: 'rejected' }, { new: true });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
