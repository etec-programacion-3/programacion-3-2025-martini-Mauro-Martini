import express from 'express';
import upload from '../middleware/upload.js';
import { checkAuthor } from '../middleware/checkAuthor.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  getGamesByUserId
} from '../controllers/gameController.js';

const router = express.Router();

// --- Rutas Públicas (no requieren login) ---

// 1. Ruta específica: /juegos/user/:userId
// DEBE IR PRIMERO para que no sea capturada por /:id
router.get('/user/:userId', getGamesByUserId); 

// 2. Ruta base: /juegos/
router.get('/', getAllGames);       

// 3. Ruta dinámica: /juegos/:id
// Esta es la más general, así que va al final de las GET
router.get('/:id', getGameById);    

// --- Rutas Protegidas (requieren login) ---

// POST /juegos/
router.post('/', authenticateToken, upload.fields([
  { name: 'archivo', maxCount: 1 }, 
  { name: 'imagen', maxCount: 1 }
]), createGame);

// PUT /juegos/:id
router.put('/:id', authenticateToken, upload.fields([
  { name: 'archivo', maxCount: 1 }, 
  { name: 'imagen', maxCount: 1 }
]), checkAuthor, updateGame);

// DELETE /juegos/:id
router.delete('/:id', authenticateToken, checkAuthor, deleteGame);

export default router;