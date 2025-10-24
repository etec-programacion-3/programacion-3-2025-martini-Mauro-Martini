import express from 'express';
import {
  createComment,
  getCommentsByGame,
  getCommentById,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

router.post('/', createComment);                     // body: { userId, gameId, dificultad, calidad, texto, script? }
router.get('/game/:gameId', getCommentsByGame);      // GET /comentarios/game/:gameId
router.get('/:id', getCommentById);                  // GET /comentarios/:id
router.put('/:id', updateComment);                   // PUT /comentarios/:id  (body must include userId)
router.delete('/:id', deleteComment);                // DELETE /comentarios/:id (userId in body or ?userId=)

export default router;