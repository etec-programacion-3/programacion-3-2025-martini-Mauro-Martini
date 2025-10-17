import GameStats from '../models/GameStats.js';
import Game from '../models/Game.js';
// ...existing code...

export const addPlayTime = async (req, res) => {
  try {
    const { id } = req.params; // gameId
    const { userId, hours } = req.body; // por ahora pasamos userId en body (temporal)
    if (!userId) return res.status(400).json({ error: 'userId requerido' });
    const h = Number(hours);
    if (!hours || isNaN(h) || h <= 0) return res.status(400).json({ error: 'hours debe ser número positivo' });

    // validar que el juego exista
    const game = await Game.findByPk(id);
    if (!game) return res.status(404).json({ error: 'Juego no encontrado' });

    // busca o crea el registro GameStats
    const [stat, created] = await GameStats.findOrCreate({
      where: { userId, gameId: id },
      defaults: { tiempoJuego: Math.round(h) }
    });

    if (!created) {
      stat.tiempoJuego = (stat.tiempoJuego || 0) + Math.round(h);
      await stat.save();
    }

    res.json({ gameId: Number(id), userId: Number(userId), tiempoJuego: stat.tiempoJuego });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getPlayTime = async (req, res) => {
  try {
    const { id } = req.params; // gameId
    const { userId } = req.query;

    const game = await Game.findByPk(id);
    if (!game) return res.status(404).json({ error: 'Juego no encontrado' });

    if (userId) {
      const stat = await GameStats.findOne({ where: { gameId: id, userId: Number(userId) } });
      if (!stat) return res.status(404).json({ error: 'Estadística no encontrada para ese usuario' });
      return res.json({ gameId: Number(id), userId: Number(userId), tiempoJuego: stat.tiempoJuego });
    }

    // devuelve todas las stats del juego
    const stats = await GameStats.findAll({ where: { gameId: id } });
    return res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ...existing code...