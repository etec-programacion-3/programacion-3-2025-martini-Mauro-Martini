import User from '../models/User.js';
import Game from '../models/Game.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['contraseña'] },
      include: [
        {
          model: Game,
          through: { attributes: [] },
          attributes: ['id', 'titulo']
        }
      ]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['contraseña'] },
      include: [
        {
          model: Game,
          attributes: ['id', 'titulo', 'descripcion']
        }
      ]
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario', details: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, nombre, contraseña } = req.body;

    if (!email || !nombre || !contraseña) {
      return res.status(400).json({ error: 'Faltan campos requeridos: email, nombre, contraseña' });
    }

    const newUser = await User.create({ email, nombre, contraseña });

    const out = newUser.toJSON();
    delete out.contraseña;

    res.status(201).json(out);
  } catch (error) {
    console.error('Error completo:', error);
    const details = error.errors ? error.errors.map(e => e.message) : error.message;
    res.status(400).json({
      error: 'Error al crear usuario',
      details
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, contraseña } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await user.update({
      ...(nombre !== undefined && { nombre }),
      ...(contraseña !== undefined && { contraseña })
    });

    const out = user.toJSON();
    delete out.contraseña;

    res.json(out);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar usuario', details: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
  }
};