import Game from '../models/Game.js';
import User from '../models/User.js';

// GET /juegos - Obtener todos los juegos
export const getAllGames = async (req, res) => {
  try {
    const games = await Game.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'nombre']
        }
      ]
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los juegos' });
  }
};

// GET /juegos/:id - Obtener un juego específico
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'nombre']
        }
      ]
    });
    
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el juego' });
  }
};

// POST /juegos - Crear nuevo juego
export const createGame = async (req, res) => {
  try {
    const { titulo, descripcion, rutaArchivos, userId } = req.body;
    
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
    const { titulo, descripcion, rutaArchivos } = req.body;
    
    const game = await Game.findByPk(id);
    
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    
    await game.update({
      titulo,
      descripcion,
      rutaArchivos
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