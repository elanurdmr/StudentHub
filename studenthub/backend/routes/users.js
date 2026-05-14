import { Router } from 'express';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Need from '../models/Need.js';
import Application from '../models/Application.js';
import Offer from '../models/Offer.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';
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
    const { skill, level } = req.body;
    if (!skill) return res.status(400).json({ error: 'skill zorunludur' });
    const skillEntry = { name: skill, level: level || 'intermediate' };
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { skills: skillEntry } },
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
      { $pull: { skills: { name: req.params.skill } } },
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

/* ── KVKK: Hesap silme (unutulma hakkı) ── */
router.delete('/:id/account', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Sadece kendi hesabınızı silebilirsiniz' });
    const uid = req.params.id;
    await Promise.all([
      Service.deleteMany({ owner: uid }),
      Project.deleteMany({ owner: uid }),
      Need.deleteMany({ owner: uid }),
      Application.deleteMany({ applicant: uid }),
      Offer.deleteMany({ offerer: uid }),
      Review.deleteMany({ reviewer: uid }),
      Message.deleteMany({ sender: uid }),
    ]);
    await User.findByIdAndDelete(uid);
    res.json({ message: 'Hesabınız ve tüm verileriniz silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── KVKK: Kişisel veri dışa aktarma ── */
router.get('/:id/export', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Sadece kendi verinizi dışa aktarabilirsiniz' });
    const uid = req.params.id;
    const [user, services, projects, needs, reviews] = await Promise.all([
      User.findById(uid).select('-password'),
      Service.find({ owner: uid }),
      Project.find({ owner: uid }),
      Need.find({ owner: uid }),
      Review.find({ reviewer: uid }),
    ]);
    res.json({ profile: user, services, projects, needs, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
