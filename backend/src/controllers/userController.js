import User from '../models/User.js';
import Game from '../models/Game.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
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
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [
        {
          model: Game,
          attributes: ['id', 'titulo', 'descripcion']
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { googleId, email, telefono, nombre } = req.body;
    
    const newUser = await User.create({
      googleId,
      email,
      telefono,
      nombre
    });
    
    res.status(201).json(newUser);
  } catch (error) {
    console.log('Error completo:', error);  // ← Agregar esto
    res.status(400).json({ 
      error: 'Error al crear usuario',
      details: error.message  // ← Agregar esto
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { telefono, nombre } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    await user.update({
      telefono,
      nombre
    });
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar usuario' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    await user.destroy();
    
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};