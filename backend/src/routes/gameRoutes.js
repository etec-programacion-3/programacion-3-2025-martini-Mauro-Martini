import express from 'express';
import upload from '../middleware/upload.js';
import {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
} from '../controllers/gameController.js';

const router = express.Router();

router.get('/', getAllGames);
router.get('/:id', getGameById);
router.post('/', upload.single('archivo'), createGame);
router.put('/:id', upload.single('archivo'), updateGame);
router.delete('/:id', deleteGame);
export default router;