import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { fetchGroqProjectMatches } from '../services/groqProjectMatch.js';

const router = Router();

router.get('/match-projects', verifyToken, asyncHandler(async (req, res) => {
  const result = await fetchGroqProjectMatches(req.user.id);
  if (result === null)
    throw new AppError('GROQ_API_KEY tanımlı değil', 503, 'SERVICE_UNAVAILABLE');
  res.json(result);
}));

export default router;
