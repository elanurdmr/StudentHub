import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { fetchGeminiProjectMatches } from '../services/geminiProjectMatch.js';

const router = Router();

router.get('/match-projects', verifyToken, asyncHandler(async (req, res) => {
  const result = await fetchGeminiProjectMatches(req.user.id);
  if (result === null)
    throw new AppError('GEMINI_API_KEY tanımlı değil', 503, 'SERVICE_UNAVAILABLE');
  res.json(result);
}));

export default router;
