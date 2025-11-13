import express from 'express';
import { getRecommendations } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /ai/recomendaciones - Obtener juegos recomendados por IA
router.get('/recomendaciones', authenticateToken, getRecommendations);

export default router;