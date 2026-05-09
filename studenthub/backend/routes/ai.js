import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { fetchGeminiProjectMatches } from '../services/geminiProjectMatch.js';

const router = Router();

router.get('/match-projects', verifyToken, async (req, res) => {
  try {
    const result = await fetchGeminiProjectMatches(req.user.id);
    if (result === null)
      return res.status(503).json({ error: 'GEMINI_API_KEY tanımlı değil' });
    res.json(result);
  } catch (err) {
    const code = err.status || 500;
    res.status(code).json({ error: err.message });
  }
});

export default router;
