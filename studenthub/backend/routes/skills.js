import { Router } from 'express';
import Skill from '../models/Skill.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/search', asyncHandler(async (req, res) => {
  const { q = '', limit = 15, category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q.trim()) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { aliases: { $elemMatch: { $regex: q, $options: 'i' } } },
    ];
  }
  const skills = await Skill.find(filter)
    .sort({ usageCount: -1, name: 1 })
    .limit(Number(limit))
    .select('name category slug iconUrl usageCount');
  res.json(skills);
}));

router.get('/popular', asyncHandler(async (req, res) => {
  const skills = await Skill.find({ isVerified: true })
    .sort({ usageCount: -1 })
    .limit(50)
    .select('name category slug iconUrl');
  res.json(skills);
}));

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Skill.distinct('category');
  res.json(categories);
}));

export default router;
