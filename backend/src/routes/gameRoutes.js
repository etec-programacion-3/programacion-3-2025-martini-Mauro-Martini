import express from 'express';
import upload from '../middleware/upload.js';
import { checkAuthor } from '../middleware/checkAuthor.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
} from '../controllers/gameController.js';

const router = express.Router();

// Rutas públicas (no requieren login)
router.get('/', getAllGames);
router.get('/:id', getGameById);

// Rutas protegidas (requieren login)
router.post('/', authenticateToken, upload.fields([
  { name: 'archivo', maxCount: 1 }, 
  { name: 'imagen', maxCount: 1 }
]), createGame);

router.put('/:id', authenticateToken, upload.fields([
  { name: 'archivo', maxCount: 1 }, 
  { name: 'imagen', maxCount: 1 }
]), checkAuthor, updateGame);

router.delete('/:id', authenticateToken, checkAuthor, deleteGame);

export default router;