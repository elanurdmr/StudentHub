import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Sadece resim dosyaları kabul edilir'));
  },
});

const router = Router();

router.post('/avatar', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const url = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.id, { avatar: url });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/portfolio', verifyToken, upload.single('file'), (req, res) => {
  try {
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
