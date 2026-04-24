import { Router } from 'express';
import Message from '../models/Message.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

function makeConvId(a, b) {
  return [a, b].sort().join('-');
}

router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const msgs = await Message.find({
      conversationId: { $regex: req.user.id },
    }).sort({ createdAt: -1 });

    const seen = new Set();
    const convos = [];
    for (const m of msgs) {
      if (!seen.has(m.conversationId)) {
        seen.add(m.conversationId);
        convos.push(m);
      }
    }
    res.json(convos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:convId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.convId })
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:convId', verifyToken, async (req, res) => {
  try {
    const msg = await Message.create({
      conversationId: req.params.convId,
      sender: req.user.id,
      text: req.body.text,
      readBy: [req.user.id],
    });
    const populated = await msg.populate('sender', 'firstName lastName avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:convId/read', verifyToken, async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.convId, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );
    res.json({ message: 'Okundu' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
