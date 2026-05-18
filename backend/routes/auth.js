import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import TokenBlacklist from '../models/TokenBlacklist.js';
import PasswordReset from '../models/PasswordReset.js';
import RefreshToken from '../models/RefreshToken.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler, AppError, UnauthorizedError } from '../middleware/errorHandler.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

/* ── Giriş kilitleme ── */
const loginAttempts = new Map();

function checkLock(email) {
  const entry = loginAttempts.get(email);
  if (!entry) return null;
  if (entry.lockedUntil && entry.lockedUntil > Date.now()) {
    const remaining = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    return `Hesabınız ${remaining} dakika kilitlendi`;
  }
  return null;
}

function recordFailure(email) {
  const entry = loginAttempts.get(email) || { count: 0, lockedUntil: null };
  entry.count += 1;
  if (entry.count >= 5) entry.lockedUntil = Date.now() + 15 * 60 * 1000;
  loginAttempts.set(email, entry);
}

function clearAttempts(email) {
  loginAttempts.delete(email);
}

/* ── Kayıt ── */
router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('Ad zorunludur'),
    body('lastName').trim().notEmpty().withMessage('Soyad zorunludur'),
    body('email').isEmail().withMessage('Geçerli bir e-posta girin'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { firstName, lastName, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });

    const user = await User.create({ firstName, lastName, email, password, onboardingCompleted: false });
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const rawRefresh = await RefreshToken.generate(user._id, req.headers['user-agent'] || '');
    res.cookie('refreshToken', rawRefresh, COOKIE_OPTS);
    res.status(201).json({ accessToken, user: user.toPublic() });
  })
);

/* ── Giriş ── */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta girin'),
    body('password').notEmpty().withMessage('Şifre zorunludur'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { email, password } = req.body;
    const lockMsg = checkLock(email);
    if (lockMsg) throw new AppError(lockMsg, 429, 'RATE_LIMITED');

    const user = await User.findOne({ email });
    if (!user) {
      recordFailure(email);
      throw new AppError('Bu e-posta adresi kayıtlı değil', 401, 'EMAIL_NOT_FOUND');
    }
    if (!(await user.comparePassword(password))) {
      recordFailure(email);
      throw new AppError('Şifrenizi kontrol edin', 401, 'WRONG_PASSWORD');
    }
    if (user.isBanned) throw new AppError('Hesabınız askıya alınmıştır', 403, 'BANNED');

    clearAttempts(email);

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const rawRefresh = await RefreshToken.generate(user._id, req.headers['user-agent'] || '');
    res.cookie('refreshToken', rawRefresh, COOKIE_OPTS);
    res.json({ accessToken, user: user.toPublic() });
  })
);

/* ── Token yenileme ── */
router.post('/refresh', asyncHandler(async (req, res) => {
  const raw = req.cookies?.refreshToken;
  if (!raw) throw new UnauthorizedError('Refresh token bulunamadı');

  const tokenDoc = await RefreshToken.verify(raw);
  if (!tokenDoc) throw new UnauthorizedError('Geçersiz veya süresi dolmuş refresh token');

  const user = await User.findById(tokenDoc.user);
  if (!user || user.isBanned) throw new UnauthorizedError();

  tokenDoc.isRevoked = true;
  await tokenDoc.save();

  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const newRawRefresh = await RefreshToken.generate(user._id, req.headers['user-agent'] || '');
  res.cookie('refreshToken', newRawRefresh, COOKIE_OPTS);
  res.json({ accessToken, user: user.toPublic() });
}));

/* ── Çıkış ── */
router.post('/logout', verifyToken, asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    await TokenBlacklist.create({ tokenHash: hash, expiresAt });
  }

  const raw = req.cookies?.refreshToken;
  if (raw) {
    const tokenDoc = await RefreshToken.verify(raw);
    if (tokenDoc) { tokenDoc.isRevoked = true; await tokenDoc.save(); }
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Çıkış yapıldı' });
}));

/* ── Şifremi unuttum ── */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-posta zorunludur' });
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'Geçerli e-posta ise sıfırlama bağlantısı gönderildi' });

  // Eski aktif tokenları iptal et
  await PasswordReset.updateMany({ userId: user._id, used: false }, { used: true });

  const token = crypto.randomBytes(32).toString('hex');
  await PasswordReset.create({ userId: user._id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
  await sendPasswordResetEmail(email, token);
  res.json({ message: 'Geçerli e-posta ise sıfırlama bağlantısı gönderildi' });
}));

/* ── Şifre sıfırla ── */
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token ve yeni şifre zorunludur' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });

  const record = await PasswordReset.findOne({ token, used: false });
  if (!record || record.expiresAt < new Date())
    return res.status(400).json({ error: 'Token geçersiz veya süresi dolmuş' });

  const user = await User.findById(record.userId);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

  user.password = newPassword;
  await user.save();
  record.used = true;
  await record.save();
  res.json({ message: 'Şifre başarıyla güncellendi' });
}));

/* ── Ben kimim ── */
router.get('/me', verifyToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  res.json(user);
}));

export default router;
