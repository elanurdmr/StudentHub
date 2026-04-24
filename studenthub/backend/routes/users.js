import { Router } from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Yetkisiz' });
    const { firstName, lastName, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/skills', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Yetkisiz' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { skills: req.body.skill } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/skills/:skill', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Yetkisiz' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { skills: req.params.skill } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/portfolio', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Yetkisiz' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { portfolio: req.body } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/portfolio/:itemId', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Yetkisiz' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { portfolio: { _id: req.params.itemId } } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
