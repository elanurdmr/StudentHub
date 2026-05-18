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
import { asyncHandler, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

const router = Router();

function calcCompletion(user) {
  let score = 0;
  if (user.avatar)                                              score += 10;
  if (user.bio?.trim())                                         score += 10;
  if (user.headline?.trim())                                    score += 10;
  if ((user.skills || []).length >= 1)                          score += 15;
  if ((user.skills || []).length >= 3)                          score += 10;
  if ((user.education || []).length >= 1)                       score += 15;
  if ((user.experience || []).length >= 1)                      score += 15;
  if ((user.languages || []).length >= 1)                       score += 10;
  if (Object.values(user.socialLinks || {}).some((v) => v))     score += 5;
  return Math.min(score, 100);
}

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw new NotFoundError('Kullanıcı');
  res.json(user);
}));

router.patch('/:id', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const { firstName, lastName, bio, avatar, headline, socialLinks, languages } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { firstName, lastName, bio, avatar, headline, socialLinks, languages },
    { new: true, runValidators: true }
  ).select('-password');
  const score = calcCompletion(user);
  if (user.completionScore !== score) {
    user.completionScore = score;
    await user.save();
  }
  res.json(user);
}));

router.post('/:id/skills', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const { skill, level } = req.body;
  if (!skill) return res.status(400).json({ error: 'skill zorunludur' });
  const skillEntry = { name: skill, level: level || 'intermediate' };
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { skills: skillEntry } },
    { new: true }
  ).select('-password');
  await User.findByIdAndUpdate(req.params.id, { completionScore: calcCompletion(user) });
  res.json({ ...user.toObject(), completionScore: calcCompletion(user) });
}));

router.delete('/:id/skills/:skill', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $pull: { skills: { name: req.params.skill } } },
    { new: true }
  ).select('-password');
  await User.findByIdAndUpdate(req.params.id, { completionScore: calcCompletion(user) });
  res.json({ ...user.toObject(), completionScore: calcCompletion(user) });
}));

router.post('/:id/portfolio', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $push: { portfolio: req.body } },
    { new: true }
  ).select('-password');
  res.json(user);
}));

router.delete('/:id/portfolio/:itemId', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $pull: { portfolio: { _id: req.params.itemId } } },
    { new: true }
  ).select('-password');
  res.json(user);
}));

/* ── Eğitim ── */
router.post('/:id/education', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $push: { education: req.body } },
    { new: true }
  ).select('-password');
  await User.findByIdAndUpdate(req.params.id, { completionScore: calcCompletion(user) });
  res.json({ ...user.toObject(), completionScore: calcCompletion(user) });
}));

router.delete('/:id/education/:educId', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $pull: { education: { _id: req.params.educId } } },
    { new: true }
  ).select('-password');
  await User.findByIdAndUpdate(req.params.id, { completionScore: calcCompletion(user) });
  res.json({ ...user.toObject(), completionScore: calcCompletion(user) });
}));

/* ── Deneyim ── */
router.post('/:id/experience', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $push: { experience: req.body } },
    { new: true }
  ).select('-password');
  await User.findByIdAndUpdate(req.params.id, { completionScore: calcCompletion(user) });
  res.json({ ...user.toObject(), completionScore: calcCompletion(user) });
}));

router.delete('/:id/experience/:expId', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $pull: { experience: { _id: req.params.expId } } },
    { new: true }
  ).select('-password');
  await User.findByIdAndUpdate(req.params.id, { completionScore: calcCompletion(user) });
  res.json({ ...user.toObject(), completionScore: calcCompletion(user) });
}));

/* ── Sertifika ── */
router.post('/:id/certifications', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $push: { certifications: req.body } },
    { new: true }
  ).select('-password');
  res.json(user);
}));

router.delete('/:id/certifications/:certId', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $pull: { certifications: { _id: req.params.certId } } },
    { new: true }
  ).select('-password');
  res.json(user);
}));

/* ── KVKK: Hesap silme ── */
router.delete('/:id/account', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
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
}));

/* ── KVKK: Veri dışa aktarma ── */
router.get('/:id/export', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const uid = req.params.id;
  const [user, services, projects, needs, reviews] = await Promise.all([
    User.findById(uid).select('-password'),
    Service.find({ owner: uid }),
    Project.find({ owner: uid }),
    Need.find({ owner: uid }),
    Review.find({ reviewer: uid }),
  ]);
  res.json({ profile: user, services, projects, needs, reviews });
}));

export default router;
