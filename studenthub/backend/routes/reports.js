import { Router } from 'express';
import Report from '../models/Report.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const { contentType, contentId, reason } = req.body;
  if (!contentType || !contentId || !reason)
    return res.status(400).json({ error: 'contentType, contentId ve reason zorunludur' });
  const report = await Report.create({ reportedBy: req.user.id, contentType, contentId, reason });
  res.status(201).json(report);
}));

router.get('/admin', verifyToken, requireAdmin, asyncHandler(async (req, res) => {
  const { status, contentType } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (contentType) filter.contentType = contentType;
  const reports = await Report.find(filter)
    .populate('reportedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
  res.json(reports);
}));

export default router;
