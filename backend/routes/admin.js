import { Router } from 'express';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Need from '../models/Need.js';
import AdminLog from '../models/AdminLog.js';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken, (req, res, next) => {
  if (req.user?.role !== 'admin') {
    AdminLog.create({
      admin: req.user?.id || null,
      action: 'unauthorized_access',
      targetType: 'admin_panel',
      details: { path: req.originalUrl, method: req.method },
    }).catch(() => {});
    return res.status(403).json({ error: 'Yetkisiz' });
  }
  next();
});

router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
}));

/* ── Kullanıcı detayı ── */
router.get('/users/:id/detail', asyncHandler(async (req, res) => {
  const [user, services, projects, needs, userLogs] = await Promise.all([
    User.findById(req.params.id).select('-password'),
    Service.find({ owner: req.params.id }).sort({ createdAt: -1 }).limit(10),
    Project.find({ owner: req.params.id }).sort({ createdAt: -1 }).limit(10),
    Need.find({ owner: req.params.id }).sort({ createdAt: -1 }).limit(10),
    AdminLog.find({ targetId: req.params.id }).populate('admin', 'firstName lastName').sort({ createdAt: -1 }).limit(10),
  ]);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  res.json({ user, services, projects, needs, logs: userLogs });
}));

router.patch('/users/:id/ban', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select('-password');
  await AdminLog.create({ admin: req.user.id, action: 'banUser', targetType: 'User', targetId: req.params.id, details: { email: user?.email } });
  res.json(user);
}));

router.patch('/users/:id/unban', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
  await AdminLog.create({ admin: req.user.id, action: 'unbanUser', targetType: 'User', targetId: req.params.id, details: { email: user?.email } });
  res.json(user);
}));

router.get('/services', asyncHandler(async (req, res) => {
  const services = await Service.find().populate('owner', 'firstName lastName email').sort({ createdAt: -1 });
  res.json(services);
}));

router.delete('/services/:id', asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  await AdminLog.create({ admin: req.user.id, action: 'removeService', targetType: 'Service', targetId: req.params.id, details: { title: service?.title } });
  res.json({ message: 'Silindi' });
}));

router.get('/projects', asyncHandler(async (req, res) => {
  const projects = await Project.find().populate('owner', 'firstName lastName email').sort({ createdAt: -1 });
  res.json(projects);
}));

router.delete('/projects/:id', asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  await AdminLog.create({ admin: req.user.id, action: 'removeProject', targetType: 'Project', targetId: req.params.id, details: { title: project?.title } });
  res.json({ message: 'Silindi' });
}));

router.get('/needs', asyncHandler(async (req, res) => {
  const needs = await Need.find().populate('owner', 'firstName lastName email').sort({ createdAt: -1 });
  res.json(needs);
}));

router.delete('/needs/:id', asyncHandler(async (req, res) => {
  const need = await Need.findByIdAndDelete(req.params.id);
  await AdminLog.create({ admin: req.user.id, action: 'removeNeed', targetType: 'Need', targetId: req.params.id, details: { title: need?.title } });
  res.json({ message: 'Silindi' });
}));

/* ── Admin istatistikleri ── */
router.get('/stats', asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const [totalUsers, newToday, newThisWeek, totalServices, totalProjects, totalNeeds,
    bannedUsers, pendingServices, pendingProjects, pendingNeeds] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    Service.countDocuments({ isApproved: true }),
    Project.countDocuments({ isApproved: true }),
    Need.countDocuments({ isApproved: true }),
    User.countDocuments({ isBanned: true }),
    Service.countDocuments({ isApproved: false }),
    Project.countDocuments({ isApproved: false }),
    Need.countDocuments({ isApproved: false }),
  ]);

  res.json({
    totalUsers, newToday, newThisWeek, totalServices, totalProjects, totalNeeds,
    bannedUsers, pendingTotal: pendingServices + pendingProjects + pendingNeeds,
  });
}));

/* ── Kategori dağılımı ── */
router.get('/category-stats', asyncHandler(async (req, res) => {
  const [serviceStats, projectStats, needStats] = await Promise.all([
    Service.aggregate([{ $match: { isApproved: true } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
    Project.aggregate([{ $match: { isApproved: true } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
    Need.aggregate([{ $match: { isApproved: true } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
  ]);
  res.json({ services: serviceStats, projects: projectStats, needs: needStats });
}));

/* ── En aktif kullanıcılar ── */
router.get('/top-users', asyncHandler(async (req, res) => {
  const [byServices, byProjects] = await Promise.all([
    Service.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$owner', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { count: 1, 'user.firstName': 1, 'user.lastName': 1, 'user.email': 1, 'user.avatar': 1, 'user.isBanned': 1 } },
    ]),
    Project.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$owner', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { count: 1, 'user.firstName': 1, 'user.lastName': 1, 'user.email': 1, 'user.avatar': 1, 'user.isBanned': 1 } },
    ]),
  ]);
  res.json({ byServices, byProjects });
}));

/* ── Platform duyurusu ── */
router.post('/announce', asyncHandler(async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Başlık ve mesaj zorunludur' });
  const allUsers = await User.find({ isBanned: false }).select('_id');
  await Notification.insertMany(
    allUsers.map((u) => ({ user: u._id, type: 'system', title, body, isRead: false }))
  );
  await AdminLog.create({
    admin: req.user.id, action: 'announce', targetType: 'platform',
    details: { title, userCount: allUsers.length },
  });
  res.json({ message: `Duyuru ${allUsers.length} kullanıcıya gönderildi`, count: allUsers.length });
}));

/* ── Admin log ── */
router.get('/logs', asyncHandler(async (req, res) => {
  const logs = await AdminLog.find()
    .populate('admin', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(logs);
}));

/* ── Onay bekleyenler ── */
router.get('/pending', asyncHandler(async (req, res) => {
  const [services, projects, needs] = await Promise.all([
    Service.find({ isApproved: false }).populate('owner', 'firstName lastName email').sort({ createdAt: -1 }),
    Project.find({ isApproved: false }).populate('owner', 'firstName lastName email').sort({ createdAt: -1 }),
    Need.find({ isApproved: false }).populate('owner', 'firstName lastName email').sort({ createdAt: -1 }),
  ]);
  res.json({ services, projects, needs });
}));

/* ── Onayla ── */
router.patch('/approve/:type/:id', asyncHandler(async (req, res) => {
  const Model = { service: Service, project: Project, need: Need }[req.params.type];
  if (!Model) return res.status(400).json({ error: 'Geçersiz tür' });
  const doc = await Model.findByIdAndUpdate(req.params.id, { isApproved: true, rejectionReason: '' }, { new: true });
  await AdminLog.create({ admin: req.user.id, action: 'approve', targetType: req.params.type, targetId: req.params.id, details: { title: doc?.title } });
  res.json(doc);
}));

/* ── Reddet ── */
router.patch('/reject/:type/:id', asyncHandler(async (req, res) => {
  const Model = { service: Service, project: Project, need: Need }[req.params.type];
  if (!Model) return res.status(400).json({ error: 'Geçersiz tür' });
  const { reason = 'İlan uygun bulunmadı.' } = req.body;
  const doc = await Model.findByIdAndUpdate(req.params.id, { isApproved: false, rejectionReason: reason }, { new: true });
  await AdminLog.create({ admin: req.user.id, action: 'reject', targetType: req.params.type, targetId: req.params.id, details: { title: doc?.title, reason } });
  res.json(doc);
}));

export default router;
