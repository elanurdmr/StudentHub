import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import TokenBlacklist from '../models/TokenBlacklist.js';
import PasswordReset from '../models/PasswordReset.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

/* ── Giriş kilitleme ── */
const loginAttempts = new Map(); // email -> { count, lockedUntil }

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
  if (entry.count >= 5) {
    entry.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { firstName, lastName, email, password } = req.body;
      if (await User.findOne({ email }))
        return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });
      const user = await User.create({ firstName, lastName, email, password });
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
      res.status(201).json({ token, user: user.toPublic() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ── Giriş ── */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta girin'),
    body('password').notEmpty().withMessage('Şifre zorunludur'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { email, password } = req.body;
      const lockMsg = checkLock(email);
      if (lockMsg) return res.status(429).json({ error: lockMsg });
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        recordFailure(email);
        return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
      }
      if (user.isBanned)
        return res.status(403).json({ error: 'Hesabınız askıya alınmıştır' });
      clearAttempts(email);
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
      res.json({ token, user: user.toPublic() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ── Çıkış (token blacklist) ── */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    await TokenBlacklist.create({ tokenHash: hash, expiresAt });
    res.json({ message: 'Çıkış yapıldı' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Şifremi unuttum ── */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-posta zorunludur' });
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'Geçerli e-posta ise sıfırlama bağlantısı gönderildi' });
    const token = crypto.randomBytes(32).toString('hex');
    await PasswordReset.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    console.log(`[ŞİFRE SIFIRLAMA] Token: ${token} — Kullanıcı: ${email}`);
    res.json({ message: 'Geçerli e-posta ise sıfırlama bağlantısı gönderildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Şifre sıfırla ── */
router.post('/reset-password', async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Ben kimim ── */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
