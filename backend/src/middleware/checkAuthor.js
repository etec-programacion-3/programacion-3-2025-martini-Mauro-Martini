import Game from '../models/Game.js';
import Comment from '../models/Comment.js';

/*
  checkAuthor (juegos)
  - Verifica que el usuario autenticado (req.user) sea el autor del juego.
  - Debe usarse DESPUÉS de authenticateToken
*/
export const checkAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'Game ID requerido' });
    
    // req.user viene del middleware authenticateToken
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!Game || typeof Game.findByPk !== 'function') {
      console.error('Modelo Game no disponible:', Game);
      return res.status(500).json({ error: 'Modelo Game no disponible' });
    }

    const game = await Game.findByPk(id);
    if (!game) return res.status(404).json({ error: 'Juego no encontrado' });

    // Obtener owner de forma segura
    const gameUserId =
      game.userId ??
      (typeof game.get === 'function' ? game.get('userId') : undefined) ??
      (game.dataValues ? game.dataValues.userId : undefined);

    if (gameUserId === undefined) {
      console.error('No se pudo leer userId del juego:', game);
      return res.status(500).json({ error: 'No se pudo leer owner del juego' });
    }

    // Comparar con el usuario autenticado
    if (Number(gameUserId) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'No autorizado: no eres el autor de este juego' });
    }
    req.game = game;
    next();
  } catch (error) {
    console.error('checkAuthor error:', error);
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
};

/*
  checkCommentAuthor (comentarios)
  - Verifica que el usuario autenticado (req.user) sea el autor del comentario.
  - Debe usarse DESPUÉS de authenticateToken
*/
export const checkCommentAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'Comment ID requerido' });

    // req.user viene del middleware authenticateToken
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!Comment || typeof Comment.findByPk !== 'function') {
      console.error('Modelo Comment no disponible:', Comment);
      return res.status(500).json({ error: 'Modelo Comment no disponible' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });

    const commentUserId =
      comment.userId ??
      (typeof comment.get === 'function' ? comment.get('userId') : undefined) ??
      (comment.dataValues ? comment.dataValues.userId : undefined);

    if (commentUserId === undefined) {
      console.error('No se pudo leer userId del comentario:', comment);
      return res.status(500).json({ error: 'No se pudo leer owner del comentario' });
    }

    // Comparar con el usuario autenticado
    if (Number(commentUserId) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'No autorizado: no eres el autor de este comentario' });
    }

    next();
  } catch (error) {
    console.error('checkCommentAuthor error:', error);
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
};