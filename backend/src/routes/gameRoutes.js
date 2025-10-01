import express from 'express';
import { 
  getAllGames, 
  getGameById, 
  createGame, 
  updateGame, 
  deleteGame 
} from '../controllers/gameController.js';

const router = express.Router();

router.get('/', getAllGames);
router.post('/', createGame);
router.get('/:id', getGameById);
router.put('/:id', updateGame);
router.delete('/:id', deleteGame);

export default router;