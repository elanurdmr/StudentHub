import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Need from '../models/Need.js';
import Offer from '../models/Offer.js';
import Notification from '../models/Notification.js';
import SearchHistory from '../models/SearchHistory.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

const router = Router();

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { /* yok say */ }
  }
  next();
}

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { category, q, owner } = req.query;
  const filter = {};
  if (owner) filter.owner = owner;
  else filter.status = 'open';
  if (category) filter.category = category;
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } },
  ];
  const needs = await Need.find(filter).populate('owner', 'firstName lastName avatar').sort({ createdAt: -1 });
  if (req.user && q) {
    SearchHistory.create({ user: req.user.id, query: q, type: 'need', resultCount: needs.length }).catch(() => {});
  }
  res.json(needs);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const need = await Need.findById(req.params.id).populate('owner', 'firstName lastName avatar rating');
  if (!need) throw new NotFoundError('İhtiyaç ilanı');
  const offers = await Offer.find({ need: req.params.id }).populate('offerer', 'firstName lastName avatar rating');
  res.json({ ...need.toObject(), offers });
}));

router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const need = await Need.create({ ...req.body, owner: req.user.id });
  res.status(201).json(need);
}));

router.patch('/:id', verifyToken, asyncHandler(async (req, res) => {
  const need = await Need.findById(req.params.id);
  if (!need) throw new NotFoundError('İhtiyaç ilanı');
  if (need.owner.toString() !== req.user.id) throw new ForbiddenError();
  Object.assign(need, req.body);
  await need.save();
  res.json(need);
}));

router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const need = await Need.findById(req.params.id);
  if (!need) throw new NotFoundError('İhtiyaç ilanı');
  if (need.owner.toString() !== req.user.id) throw new ForbiddenError();
  await need.deleteOne();
  res.json({ message: 'Silindi' });
}));

router.post('/:id/offers', verifyToken, asyncHandler(async (req, res) => {
  const need = await Need.findById(req.params.id).populate('owner');
  if (!need) throw new NotFoundError('İhtiyaç ilanı');
  const offer = await Offer.create({ ...req.body, need: req.params.id, offerer: req.user.id });
  await Notification.create({
    user: need.owner._id,
    type: 'offer',
    title: 'Yeni teklif aldınız',
    body: `"${need.title}" ilanınıza yeni bir teklif geldi.`,
    link: `/detail/need/${need._id}`,
  });
  res.status(201).json(offer);
}));

router.patch('/:needId/offers/:offerId/accept', verifyToken, asyncHandler(async (req, res) => {
  const need = await Need.findById(req.params.needId);
  if (!need || need.owner.toString() !== req.user.id) throw new ForbiddenError();
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
}));

router.patch('/:needId/offers/:offerId/reject', verifyToken, asyncHandler(async (req, res) => {
  const need = await Need.findById(req.params.needId);
  if (!need || need.owner.toString() !== req.user.id) throw new ForbiddenError();
  const offer = await Offer.findByIdAndUpdate(req.params.offerId, { status: 'rejected' }, { new: true });
  res.json(offer);
}));

export default router;
