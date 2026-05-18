import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import TokenBlacklist from '../models/TokenBlacklist.js';

export async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Yetkisiz erişim' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const blacklisted = await TokenBlacklist.findOne({ tokenHash: hash });
    if (blacklisted) return res.status(401).json({ error: 'Token geçersiz kılındı' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
  next();
}

export async function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const blacklisted = await TokenBlacklist.findOne({ tokenHash: hash });
    if (!blacklisted) req.user = decoded;
  } catch { /* token geçersizse sessizce geç */ }
  next();
}
