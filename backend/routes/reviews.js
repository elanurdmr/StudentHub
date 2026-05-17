import { Router } from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import UserStatistics from '../models/UserStatistics.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const { target, rating, comment, serviceId } = req.body;
  const review = await Review.create({ reviewer: req.user.id, target, rating, comment, serviceId });
  const reviews = await Review.find({ target });
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await User.findByIdAndUpdate(target, { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length });
  UserStatistics.findOneAndUpdate(
    { user: target },
    { avgRating: Math.round(avg * 10) / 10, updatedAt: new Date() },
    { upsert: true }
  ).catch(() => {});
  await Notification.create({
    user: target,
    type: 'review',
    title: 'Yeni değerlendirme aldınız',
    body: `${rating} yıldız değerlendirme aldınız.`,
    link: `/profile/${target}`,
  });
  res.status(201).json(review);
}));

router.get('/', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ target: req.query.user_id })
    .populate('reviewer', 'firstName lastName avatar')
    .sort({ createdAt: -1 });
  res.json(reviews);
}));

export default router;
