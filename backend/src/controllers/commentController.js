import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Game from '../models/Game.js';
import GameStats from '../models/GameStats.js';
import { fn, col } from 'sequelize';

// helper: recalcula promedios y actualiza el juego
const recalculateGameRatings = async (gameId) => {
  const averages = await Comment.findAll({
    where: { gameId: Number(gameId) },
    attributes: [
      [fn('AVG', col('dificultad')), 'avgDificultad'],
      [fn('AVG', col('calidad')), 'avgCalidad']
    ],
    raw: true
  });

  const row = averages[0] || {};
  const avgDificultad = parseFloat(row.avgDificultad) || 0;
  const avgCalidad = parseFloat(row.avgCalidad) || 0;

  await Game.update(
    { avgDificultad, avgCalidad },
    { where: { id: Number(gameId) } }
  );
};

// Crear comentario: body { userId, gameId, dificultad, calidad, texto, script? }
export const createComment = async (req, res) => {
  try {
    const { userId, gameId, dificultad, calidad, texto, script } = req.body;
    if (!userId || !gameId || !dificultad || !calidad || !texto) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const user = await User.findByPk(Number(userId));
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const game = await Game.findByPk(Number(gameId));
    if (!game) return res.status(404).json({ error: 'Juego no encontrado' });

    const stat = await GameStats.findOne({ where: { userId: Number(userId), gameId: Number(gameId) } });
    const tiempo = stat ? stat.tiempoJuego : 0;

    const comment = await Comment.create({
      userId: Number(userId),
      gameId: Number(gameId),
      dificultad: Number(dificultad),
      calidad: Number(calidad),
      texto,
      script: script || null,
      tiempoJuego: tiempo
    });

    // recalcular promedios y actualizar la fila Game
    await recalculateGameRatings(gameId);

    res.status(201).json(comment);
  } catch (error) {
    const details = error.errors ? error.errors.map(e => e.message) : error.message;
    res.status(400).json({ error: 'Error al crear comentario', details });
  }
};

// GET /comentarios/game/:gameId  -> devuelve comentarios con tiempoJuego actualizado desde GameStats
export const getCommentsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const comments = await Comment.findAll({
      where: { gameId: Number(gameId) },
      include: [{ model: User, attributes: ['id', 'nombre', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    // actualizar tiempoJuego desde GameStats por cada comentario
    const enriched = await Promise.all(comments.map(async (c) => {
      const stat = await GameStats.findOne({ where: { userId: c.userId, gameId: c.gameId } });
      const tiempo = stat ? stat.tiempoJuego : 0;
      const data = c.toJSON();
      data.tiempoJuego = tiempo;
      return data;
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comentarios', details: error.message });
  }
};

// GET /comentarios/:id  -> devuelve comentario con tiempoJuego actualizado desde GameStats
export const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(Number(id), {
      include: [{ model: User, attributes: ['id', 'nombre', 'email'] }]
    });
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });

    const stat = await GameStats.findOne({ where: { userId: comment.userId, gameId: comment.gameId } });
    const data = comment.toJSON();
    data.tiempoJuego = stat ? stat.tiempoJuego : 0;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comentario', details: error.message });
  }
};

// Actualizar comentario (solo autor) PUT /comentarios/:id
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, dificultad, calidad, texto, script } = req.body;

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });

    if (!userId || comment.userId !== Number(userId)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este comentario' });
    }

    await comment.update({
      ...(dificultad !== undefined && { dificultad: Number(dificultad) }),
      ...(calidad !== undefined && { calidad: Number(calidad) }),
      ...(texto !== undefined && { texto }),
      ...(script !== undefined && { script })
    });

    // recalcular promedios y actualizar la fila Game
    await recalculateGameRatings(comment.gameId);

    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar comentario', details: error.message });
  }
};

// Eliminar comentario (solo autor) DELETE /comentarios/:id
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || req.query.userId;
    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });

    if (!userId || comment.userId !== Number(userId)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este comentario' });
    }

    const gameId = comment.gameId;
    await comment.destroy();

    // recalcular promedios y actualizar la fila Game
    await recalculateGameRatings(gameId);

    res.json({ message: 'Comentario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
};