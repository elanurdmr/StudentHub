import { Router } from 'express';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/summary', verifyToken, async (req, res) => {
  try {
    const [services, projects, applications, unreadNotifs] = await Promise.all([
      Service.countDocuments({ owner: req.user.id }),
      Project.countDocuments({ owner: req.user.id }),
      Application.countDocuments({ applicant: req.user.id }),
      Notification.countDocuments({ user: req.user.id, isRead: false }),
    ]);
    res.json({ services, projects, applications, unreadNotifs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/projects/progress', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).select('title status applicationCount teamSize');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
