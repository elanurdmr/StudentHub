import { Router } from 'express';
import Report from '../models/Report.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Need from '../models/Need.js';
import User from '../models/User.js';
import AdminLog from '../models/AdminLog.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/* Şikayet et */
router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const { contentType, contentId, reason } = req.body;
  if (!contentType || !contentId || !reason)
    return res.status(400).json({ error: 'contentType, contentId ve reason zorunludur' });

  // Aynı kullanıcı aynı içeriği tekrar şikayet edemesin
  const existing = await Report.findOne({ reportedBy: req.user.id, contentId });
  if (existing) return res.status(409).json({ error: 'Bu içeriği zaten şikayet ettiniz' });

  const report = await Report.create({ reportedBy: req.user.id, contentType, contentId, reason });
  res.status(201).json(report);
}));

/* Admin — liste (içerik başlıklarıyla birlikte) */
router.get('/admin', verifyToken, requireAdmin, asyncHandler(async (req, res) => {
  const { status, contentType } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (contentType && contentType !== 'all') filter.contentType = contentType;

  const reports = await Report.find(filter)
    .populate('reportedBy', 'firstName lastName email avatar')
    .sort({ createdAt: -1 });

  // Her şikayetin hedef içeriğini çek (başlık / isim için)
  const enriched = await Promise.all(reports.map(async (r) => {
    let contentTitle = null;
    let contentOwner = null;
    try {
      if (r.contentType === 'service') {
        const s = await Service.findById(r.contentId).select('title owner').populate('owner', 'firstName lastName');
        contentTitle = s?.title;
        contentOwner = s?.owner ? `${s.owner.firstName} ${s.owner.lastName}` : null;
      } else if (r.contentType === 'project') {
        const p = await Project.findById(r.contentId).select('title owner').populate('owner', 'firstName lastName');
        contentTitle = p?.title;
        contentOwner = p?.owner ? `${p.owner.firstName} ${p.owner.lastName}` : null;
      } else if (r.contentType === 'need') {
        const n = await Need.findById(r.contentId).select('title owner').populate('owner', 'firstName lastName');
        contentTitle = n?.title;
        contentOwner = n?.owner ? `${n.owner.firstName} ${n.owner.lastName}` : null;
      } else if (r.contentType === 'user') {
        const u = await User.findById(r.contentId).select('firstName lastName email');
        contentTitle = u ? `${u.firstName} ${u.lastName}` : null;
      }
    } catch { /* içerik silinmişse boş bırak */ }
    return { ...r.toObject(), contentTitle, contentOwner };
  }));

  res.json(enriched);
}));

/* Admin — durum güncelle */
router.patch('/:id', verifyToken, requireAdmin, asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  if (!['pending', 'reviewed', 'dismissed'].includes(status))
    return res.status(400).json({ error: 'Geçersiz durum' });

  const update = { status, adminNote: adminNote || '' };
  if (status !== 'pending') update.reviewedAt = new Date();

  const report = await Report.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate('reportedBy', 'firstName lastName email');

  await AdminLog.create({
    admin: req.user.id,
    action: status === 'reviewed' ? 'reviewReport' : 'dismissReport',
    targetType: 'Report',
    targetId: req.params.id,
    details: { contentType: report?.contentType, adminNote },
  }).catch(() => {});

  res.json(report);
}));

export default router;
