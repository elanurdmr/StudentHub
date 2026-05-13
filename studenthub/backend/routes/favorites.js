import { Router } from 'express';
import Favorite from '../models/Favorite.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.post('/toggle', async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
