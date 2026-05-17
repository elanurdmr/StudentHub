import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Service from '../models/Service.js';
import ServiceOrder from '../models/ServiceOrder.js';
import Notification from '../models/Notification.js';
import UserStatistics from '../models/UserStatistics.js';
import SearchHistory from '../models/SearchHistory.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler, NotFoundError, AppError, ForbiddenError } from '../middleware/errorHandler.js';
import { createPaymentIntent, confirmPayment } from '../services/paymentService.js';

const router = Router();

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { /* yok say */ }
  }
  next();
}

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    category, q, sort, owner, minPrice, maxPrice,
    skills, minRating, maxDeliveryDays,
    dateFrom, dateTo,
    page = 1, limit = 20,
  } = req.query;

  const filter = { isActive: true };
  if (owner) filter.owner = owner;
  if (category) filter.category = category;
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } },
    { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
  ];
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (maxDeliveryDays) filter.deliveryDays = { $lte: Number(maxDeliveryDays) };
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim());
    const owners = await User.find({
      'skills.name': { $in: skillList.map((s) => new RegExp(s, 'i')) },
    }).select('_id');
    const ownerIds = owners.map((u) => u._id);
    filter.owner = { $in: ownerIds };
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1, reviewCount: -1 },
    popular: { purchaseCount: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  };
  const sortObj = sortMap[sort] || { createdAt: -1 };
  const skip = (Number(page) - 1) * Number(limit);

  const [results, total] = await Promise.all([
    Service.find(filter).populate('owner', 'firstName lastName avatar rating').sort(sortObj).skip(skip).limit(Number(limit)),
    Service.countDocuments(filter),
  ]);

  if (req.user && q) {
    SearchHistory.create({ user: req.user.id, query: q, type: 'service', resultCount: total }).catch(() => {});
  }

  res.json({
    data: results,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
}));

router.get('/mine', verifyToken, asyncHandler(async (req, res) => {
  const services = await Service.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(services);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('owner', 'firstName lastName avatar rating reviewCount bio skills');
  if (!service) throw new NotFoundError('Hizmet');
  res.json(service);
}));

router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const service = await Service.create({ ...req.body, owner: req.user.id });
  res.status(201).json(service);
}));

router.patch('/:id', verifyToken, asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new NotFoundError('Hizmet');
  if (service.owner.toString() !== req.user.id) throw new ForbiddenError();
  Object.assign(service, req.body);
  await service.save();
  res.json(service);
}));

router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new NotFoundError('Hizmet');
  if (service.owner.toString() !== req.user.id) throw new ForbiddenError();
  await service.deleteOne();
  res.json({ message: 'Silindi' });
}));

/* ── Satın al (eski basit endpoint) ── */
router.post('/:id/purchase', verifyToken, asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate('owner');
  if (!service) throw new NotFoundError('Hizmet');
  if (service.owner._id.toString() === req.user.id)
    throw new AppError('Kendi hizmetinizi satın alamazsınız', 400);

  await ServiceOrder.create({
    buyer: req.user.id,
    seller: service.owner._id,
    service: service._id,
    amount: service.price,
    status: 'completed',
  });
  service.purchaseCount += 1;
  await service.save();
  UserStatistics.findOneAndUpdate(
    { user: service.owner._id },
    { $inc: { completedJobs: 1, totalEarnings: service.price } },
    { upsert: true }
  ).catch(() => {});
  await Notification.create({
    user: service.owner._id,
    type: 'purchase',
    title: 'Hizmetiniz satın alındı',
    body: `"${service.title}" hizmetiniz yeni bir müşteri tarafından satın alındı.`,
    link: `/detail/service/${service._id}`,
  });
  res.status(201).json({ message: 'Satın alma başarılı', serviceId: service._id });
}));

/* ── Ödeme akışı: Checkout başlat ── */
router.post('/:id/checkout', verifyToken, asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate('owner');
  if (!service) throw new NotFoundError('Hizmet');
  if (service.owner._id.toString() === req.user.id)
    throw new AppError('Kendi hizmetinizi satın alamazsınız', 400);

  const intent = await createPaymentIntent({
    amount: service.price,
    metadata: { serviceId: service._id.toString(), buyerId: req.user.id },
  });

  res.json({
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
    amount: service.price,
    serviceName: service.title,
  });
}));

/* ── Ödeme akışı: Ödemeyi onayla ── */
router.post('/:id/confirm-payment', verifyToken, asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) throw new AppError('paymentIntentId zorunludur', 400);

  const confirmation = await confirmPayment(paymentIntentId);
  if (confirmation.status !== 'succeeded')
    throw new AppError('Ödeme onaylanamadı', 402);

  const service = await Service.findById(req.params.id).populate('owner');
  if (!service) throw new NotFoundError('Hizmet');

  const order = await ServiceOrder.create({
    buyer: req.user.id,
    seller: service.owner._id,
    service: service._id,
    amount: service.price,
    paymentIntentId,
    status: 'completed',
  });
  service.purchaseCount += 1;
  await service.save();
  UserStatistics.findOneAndUpdate(
    { user: service.owner._id },
    { $inc: { completedJobs: 1, totalEarnings: service.price } },
    { upsert: true }
  ).catch(() => {});
  await Notification.create({
    user: service.owner._id,
    type: 'purchase',
    title: 'Hizmetiniz satın alındı',
    body: `"${service.title}" hizmetiniz satın alındı.`,
    link: `/detail/service/${service._id}`,
  });
  res.json({ message: 'Ödeme başarılı', orderId: order._id });
}));

export default router;
