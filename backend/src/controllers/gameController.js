import Game from '../models/Game.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import GameStats from '../models/GameStats.js';
import { fn, col } from 'sequelize';

// GET /juegos - Obtener todos los juegos con promedio de dificultad y calidad y total tiempo
export const getAllGames = async (req, res) => {
  try {
    const games = await Game.findAll({
      attributes: {
        include: [
          [fn('ROUND', fn('AVG', col('Comments.dificultad')), 2), 'avgDificultad'],
          [fn('ROUND', fn('AVG', col('Comments.calidad')), 2), 'avgCalidad'],
          [fn('COALESCE', fn('SUM', col('GameStats.tiempoJuego')), 0), 'totalTiempo'] // suma de tiempo por juego
        ]
      },
      include: [
        { model: User, attributes: ['id', 'nombre'] },
        { model: Comment, attributes: [] },    // necesario para AVG
        { model: GameStats, attributes: [] }   // necesario para SUM
      ],
      group: ['Game.id', 'User.id', 'User.nombre']
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /juegos/:id - Obtener un juego específico con promedios y total tiempo
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;

    const games = await Game.findAll({
      where: { id: Number(id) },
      attributes: {
        include: [
          [fn('ROUND', fn('AVG', col('Comments.dificultad')), 2), 'avgDificultad'],
          [fn('ROUND', fn('AVG', col('Comments.calidad')), 2), 'avgCalidad'],
          [fn('COALESCE', fn('SUM', col('GameStats.tiempoJuego')), 0), 'totalTiempo']
        ]
      },
      include: [
        { model: User, attributes: ['id', 'nombre'] },
        { model: Comment, attributes: [] },
        { model: GameStats, attributes: [] }
      ],
      group: ['Game.id', 'User.id', 'User.nombre']
    });

    const game = games[0] || null;

    if (!game) return res.status(404).json({ error: 'Juego no encontrado' });

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /juegos - Crear nuevo juego
export const createGame = async (req, res) => {
  try {
    const { titulo, descripcion, userId } = req.body;
    // Si hay archivo subido, guarda el nombre, si no, null
    const rutaArchivos = req.file ? req.file.filename : null;

    const newGame = await Game.create({
      titulo,
      descripcion,
      rutaArchivos,
      userId
    });

    res.status(201).json(newGame);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el juego' });
  }
};

// PUT /juegos/:id - Actualizar juego
export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;
    const rutaArchivos = req.file ? req.file.filename : undefined;

    const game = await Game.findByPk(id);

    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    // Solo actualiza rutaArchivos si hay un archivo nuevo
    await game.update({
      titulo,
      descripcion,
      ...(rutaArchivos && { rutaArchivos })
    });

    res.json(game);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el juego' });
  }
};

// DELETE /juegos/:id - Eliminar juego
export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await Game.findByPk(id);
    
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    
    await game.destroy();
    
    res.json({ message: 'Juego eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el juego' });
  }
};