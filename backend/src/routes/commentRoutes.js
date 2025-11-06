import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkCommentAuthor } from '../middleware/checkAuthor.js';
import {
  createComment,
  getCommentsByGame,
  getCommentById,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

// Rutas públicas
router.get('/game/:gameId', getCommentsByGame);
router.get('/:id', getCommentById);

// Rutas protegidas (requieren login)
router.post('/', authenticateToken, createComment);
router.put('/:id', authenticateToken, checkCommentAuthor, updateComment);
router.delete('/:id', authenticateToken, checkCommentAuthor, deleteComment);

export default router;