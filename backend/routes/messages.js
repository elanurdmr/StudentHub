import { Router } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler, ForbiddenError } from '../middleware/errorHandler.js';
import { getOtherParticipantId, userBelongsToConversation } from '../utils/conversation.js';

const router = Router();

router.get('/conversations', verifyToken, asyncHandler(async (req, res) => {
  const uid = req.user.id.toString();
  const msgs = await Message.find({ conversationId: new RegExp(`(^|-)${uid}(-|$)`) }).sort({ createdAt: -1 });

  const latestByConv = new Map();
  for (const m of msgs) {
    if (!latestByConv.has(m.conversationId)) latestByConv.set(m.conversationId, m);
  }

  const out = [];
  for (const [conversationId, lastMsgDoc] of latestByConv.entries()) {
    const otherId = getOtherParticipantId(conversationId, uid);
    if (!otherId || !mongoose.Types.ObjectId.isValid(otherId)) continue;
    const [otherUser, unread] = await Promise.all([
      User.findById(otherId).select('firstName lastName avatar'),
      Message.countDocuments({ conversationId, sender: { $ne: uid }, readBy: { $ne: uid } }),
    ]);
    const lastSender = await User.findById(lastMsgDoc.sender).select('firstName lastName avatar').catch(() => null);
    out.push({
      conversationId,
      otherUser: otherUser
        ? { _id: otherUser._id, firstName: otherUser.firstName, lastName: otherUser.lastName, avatar: otherUser.avatar }
        : undefined,
      lastMessage: {
        text: lastMsgDoc.text,
        createdAt: lastMsgDoc.createdAt,
        sender: lastSender
          ? { _id: lastSender._id, firstName: lastSender.firstName, lastName: lastSender.lastName, avatar: lastSender.avatar }
          : lastMsgDoc.sender,
      },
      unread,
    });
  }
  out.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
  res.json(out);
}));

router.get('/:convId', verifyToken, asyncHandler(async (req, res) => {
  if (!userBelongsToConversation(req.params.convId, req.user.id)) throw new ForbiddenError();
  const messages = await Message.find({ conversationId: req.params.convId })
    .populate('sender', 'firstName lastName avatar')
    .sort({ createdAt: 1 });
  res.json(messages);
}));

router.post('/:convId', verifyToken, asyncHandler(async (req, res) => {
  if (!userBelongsToConversation(req.params.convId, req.user.id)) throw new ForbiddenError();
  const msg = await Message.create({
    conversationId: req.params.convId,
    sender: req.user.id,
    text: req.body.text,
    readBy: [req.user.id],
  });
  const populated = await msg.populate('sender', 'firstName lastName avatar');
  res.status(201).json(populated);
}));

router.patch('/:convId/read', verifyToken, asyncHandler(async (req, res) => {
  if (!userBelongsToConversation(req.params.convId, req.user.id)) throw new ForbiddenError();
  await Message.updateMany(
    { conversationId: req.params.convId, readBy: { $ne: req.user.id } },
    { $addToSet: { readBy: req.user.id } }
  );
  res.json({ message: 'Okundu' });
}));

export default router;
