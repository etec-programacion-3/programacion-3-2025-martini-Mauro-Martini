import express from 'express';

const router = express.Router();

// GET /juegos - Listar todos los juegos
router.get('/', (req, res) => {
  res.json({ message: 'Obtener todos los juegos' });
});

// POST /juegos - Crear nuevo juego
router.post('/', (req, res) => {
  res.json({ message: 'Crear nuevo juego' });
});

// GET /juegos/:id - Obtener juego específico
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Obtener juego con ID: ${id}` });
});

// PUT /juegos/:id - Actualizar juego
router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Actualizar juego con ID: ${id}` });
});

// DELETE /juegos/:id - Eliminar juego
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Eliminar juego con ID: ${id}` });
});

export default router;