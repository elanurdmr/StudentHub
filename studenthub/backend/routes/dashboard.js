import { Router } from 'express';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import ServiceOrder from '../models/ServiceOrder.js';
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

/** Kazanç özeti (satıcı olarak), harcama (alıcı olarak), iş geçmişi */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const uid = req.user.id;
    const [salesAgg, purchaseAgg, totalSalesOrders, purchasesList, acceptedApps] = await Promise.all([
      ServiceOrder.aggregate([
        { $match: { seller: uid, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      ServiceOrder.aggregate([
        { $match: { buyer: uid, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      ServiceOrder.countDocuments({ seller: uid }),
      ServiceOrder.find({ buyer: uid })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('service', 'title price image')
        .populate('seller', 'firstName lastName avatar'),
      Application.find({ applicant: uid, status: 'accepted' }).sort({ updatedAt: -1 }).limit(15).populate('project', 'title status category'),
    ]);
    const sales = salesAgg[0] || { total: 0, count: 0 };
    const buys = purchaseAgg[0] || { total: 0, count: 0 };

    const completedOwnedProjects = await Project.countDocuments({ owner: uid, status: 'completed' });

    res.json({
      earnings: { total: sales.total || 0, orderCount: sales.count || 0, totalSalesListed: totalSalesOrders },
      spending: { total: buys.total || 0, orderCount: buys.count || 0 },
      recentPurchases: purchasesList,
      completedProjectsOwned: completedOwnedProjects,
      acceptedApplications: acceptedApps,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
