import express from 'express';
import { addPlayTime, getPlayTime } from '../controllers/statsController.js';

const router = express.Router();

router.post('/:id', addPlayTime);
router.get('/:id', getPlayTime);    // obtener stats por gameId (opcional ?userId=1)

export default router;