import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xssClean from 'xss-clean';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import servicesRoutes from './routes/services.js';
import needsRoutes from './routes/needs.js';
import projectsRoutes from './routes/projects.js';
import messagesRoutes from './routes/messages.js';
import reviewsRoutes from './routes/reviews.js';
import notificationsRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import favoritesRoutes from './routes/favorites.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';
import User from './models/User.js';
import { userBelongsToConversation } from './utils/conversation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(xssClean());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 50,
  message: { error: 'Çok fazla deneme, lütfen daha sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/needs', needsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/favorites', favoritesRoutes);

/* ── Socket.io ── */
const userSockets = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Yetkisiz'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Geçersiz token'));
  }
});

io.on('connection', async (socket) => {
  const userId = socket.user.id;
  userSockets.set(userId, socket.id);
  try {
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
  } catch {
    /* yok say */
  }
  io.emit('presence', { userId, online: true });

  socket.on('join_conversation', (convId) => socket.join(convId));

  socket.on('send_message', async ({ convId, text }) => {
    try {
      const uid = String(userId);
      if (!convId || !text?.trim())
        return socket.emit('error', 'Konuşma veya mesaj eksik');
      if (!userBelongsToConversation(convId, uid))
        return socket.emit('error', 'Bu konuşmaya mesaj gönderemezsiniz');

      const msg = await Message.create({
        conversationId: convId,
        sender: userId,
        text: text.trim(),
        readBy: [uid],
      });
      const populated = await msg.populate('sender', 'firstName lastName avatar');
      io.to(convId).emit('new_message', { convId, message: populated });

      const parts = convId.split('-');
      const recipientId = parts[0] === uid ? parts[1] : parts[0];
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        const notif = await Notification.create({
          user: recipientId,
          type: 'message',
          title: 'Yeni mesaj',
          body: text.trim().substring(0, 60),
          link: '/messages',
        });
        io.to(recipientSocketId).emit('notification', notif);
      }
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('typing_start', (convId) => socket.to(convId).emit('typing', { convId, userId, typing: true }));
  socket.on('typing_stop', (convId) => socket.to(convId).emit('typing', { convId, userId, typing: false }));

  socket.on('mark_read', async (convId) => {
    if (!userBelongsToConversation(convId, String(userId))) return;
    await Message.updateMany(
      { conversationId: convId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
  });

  socket.on('disconnect', async () => {
    userSockets.delete(userId);
    try {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
    } catch {
      /* */
    }
    io.emit('presence', { userId, online: false });
  });
});

/* ── DB + Start ── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB bağlantısı kuruldu');
    httpServer.listen(process.env.PORT, () =>
      console.log(`Sunucu http://localhost:${process.env.PORT} adresinde çalışıyor`),
    );
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });
