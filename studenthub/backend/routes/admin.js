import { Router } from 'express';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Need from '../models/Need.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, requireAdmin);

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
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/unban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
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
    await Service.findByIdAndDelete(req.params.id);
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
    await Project.findByIdAndDelete(req.params.id);
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
    await Need.findByIdAndDelete(req.params.id);
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
