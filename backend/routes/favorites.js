import { Router } from 'express';
import Favorite from '../models/Favorite.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Need from '../models/Need.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(verifyToken);

router.post('/toggle', asyncHandler(async (req, res) => {
  const { contentType, contentId } = req.body;
  if (!contentType || !contentId)
    return res.status(400).json({ error: 'contentType ve contentId zorunludur' });
  const existing = await Favorite.findOne({ user: req.user.id, contentType, contentId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ favorited: false });
  }
  await Favorite.create({ user: req.user.id, contentType, contentId });
  res.json({ favorited: true });
}));

router.get('/', asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 });

  const enriched = await Promise.all(favorites.map(async (fav) => {
    let title = null;
    try {
      if (fav.contentType === 'service') {
        const doc = await Service.findById(fav.contentId).select('title').lean();
        title = doc?.title;
      } else if (fav.contentType === 'project') {
        const doc = await Project.findById(fav.contentId).select('title').lean();
        title = doc?.title;
      } else if (fav.contentType === 'need') {
        const doc = await Need.findById(fav.contentId).select('title').lean();
        title = doc?.title;
      }
    } catch { /* içerik silinmiş olabilir */ }
    return { ...fav.toObject(), contentTitle: title };
  }));

  res.json(enriched);
}));

export default router;
