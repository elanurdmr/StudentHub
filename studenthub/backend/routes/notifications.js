import { Router } from 'express';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', verifyToken, asyncHandler(async (req, res) => {
  const notifs = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifs);
}));

router.patch('/:id/read', verifyToken, asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isRead: true },
    { new: true }
  );
  res.json(n);
}));

router.patch('/read-all', verifyToken, asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
  res.json({ message: 'Tümü okundu' });
}));

export default router;
