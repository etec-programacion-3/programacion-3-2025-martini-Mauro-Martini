import Game from '../models/Game.js';

export const checkAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }
    
    const game = await Game.findByPk(id);
    
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    
    if (game.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este juego' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
};