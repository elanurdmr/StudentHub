import mongoose from 'mongoose';
import crypto from 'crypto';

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true, index: true },
  deviceInfo: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
}, { timestamps: true });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.generate = async function (userId, deviceInfo = '') {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await this.create({ user: userId, tokenHash: hash, deviceInfo, expiresAt });
  return raw;
};

refreshTokenSchema.statics.verify = async function (raw) {
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return this.findOne({ tokenHash: hash, isRevoked: false, expiresAt: { $gt: new Date() } });
};

export default mongoose.model('RefreshToken', refreshTokenSchema);
