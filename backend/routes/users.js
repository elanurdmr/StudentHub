import { Router } from 'express';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Need from '../models/Need.js';
import Application from '../models/Application.js';
import Offer from '../models/Offer.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import RefreshToken from '../models/RefreshToken.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
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

router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const isOwn = req.user?.id === req.params.id;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    isOwn ? {} : { $inc: { profileViews: 1 } },
    { new: true }
  ).select('-password -blockedUsers');
  if (!user) throw new NotFoundError('Kullanıcı');

  let isFollowing = false;
  let isBlocked = false;
  if (req.user && !isOwn) {
    const me = await User.findById(req.user.id).select('following blockedUsers');
    isFollowing = me?.following?.some((f) => String(f) === req.params.id) || false;
    isBlocked   = me?.blockedUsers?.some((b) => String(b) === req.params.id) || false;
  }

  res.json({ ...user.toObject(), isFollowing, isBlocked });
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

/* ── Takip / Takipten çık ── */
router.post('/:id/follow', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) return res.status(400).json({ error: 'Kendinizi takip edemezsiniz' });
  await Promise.all([
    User.findByIdAndUpdate(req.user.id, { $addToSet: { following: req.params.id } }),
    User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user.id } }),
  ]);
  res.json({ following: true });
}));

router.delete('/:id/follow', verifyToken, asyncHandler(async (req, res) => {
  await Promise.all([
    User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.id } }),
    User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } }),
  ]);
  res.json({ following: false });
}));

router.get('/:id/followers', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('followers', 'firstName lastName avatar headline').select('followers');
  if (!user) throw new NotFoundError('Kullanıcı');
  res.json(user.followers || []);
}));

router.get('/:id/following', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('following', 'firstName lastName avatar headline').select('following');
  if (!user) throw new NotFoundError('Kullanıcı');
  res.json(user.following || []);
}));

/* ── Engelle / Engeli kaldır ── */
router.post('/:id/block', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) return res.status(400).json({ error: 'Kendinizi engelleyemezsiniz' });
  await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedUsers: req.params.id } });
  res.json({ blocked: true });
}));

router.delete('/:id/block', verifyToken, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: req.params.id } });
  res.json({ blocked: false });
}));

router.get('/:id/blocked', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findById(req.params.id).populate('blockedUsers', 'firstName lastName avatar headline').select('blockedUsers');
  if (!user) throw new NotFoundError('Kullanıcı');
  res.json(user.blockedUsers || []);
}));

/* ── Onboarding tamamla ── */
router.patch('/:id/complete-onboarding', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { onboardingCompleted: true },
    { new: true }
  ).select('-password');
  if (!user) throw new NotFoundError('Kullanıcı');
  res.json(user);
}));

/* ── Hesap silme ── */
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
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
    Notification.deleteMany({ user: uid }),
    RefreshToken.deleteMany({ user: uid }),
    // Diğer kullanıcıların listelerinden çıkar
    User.updateMany(
      { $or: [{ followers: uid }, { following: uid }, { blockedUsers: uid }] },
      { $pull: { followers: uid, following: uid, blockedUsers: uid } }
    ),
  ]);

  await User.findByIdAndDelete(uid);
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Hesap silindi' });
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
