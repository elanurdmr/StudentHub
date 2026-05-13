import { Router } from 'express';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Need from '../models/Need.js';
import AdminLog from '../models/AdminLog.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

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

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select('-password');
    await AdminLog.create({
      admin: req.user.id,
      action: 'banUser',
      targetType: 'User',
      targetId: req.params.id,
      details: { email: user?.email },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/unban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
    await AdminLog.create({
      admin: req.user.id,
      action: 'unbanUser',
      targetType: 'User',
      targetId: req.params.id,
      details: { email: user?.email },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/services', async (req, res) => {
  try {
    const services = await Service.find().populate('owner', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    await AdminLog.create({
      admin: req.user.id,
      action: 'removeService',
      targetType: 'Service',
      targetId: req.params.id,
      details: { title: service?.title },
    });
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().populate('owner', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    await AdminLog.create({
      admin: req.user.id,
      action: 'removeProject',
      targetType: 'Project',
      targetId: req.params.id,
      details: { title: project?.title },
    });
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/needs', async (req, res) => {
  try {
    const needs = await Need.find().populate('owner', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/needs/:id', async (req, res) => {
  try {
    const need = await Need.findByIdAndDelete(req.params.id);
    await AdminLog.create({
      admin: req.user.id,
      action: 'removeNeed',
      targetType: 'Need',
      targetId: req.params.id,
      details: { title: need?.title },
    });
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
