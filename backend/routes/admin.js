import { Router } from 'express';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Need from '../models/Need.js';
import AdminLog from '../models/AdminLog.js';
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

export default router;
