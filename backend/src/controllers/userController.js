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
    // Captura la nueva data:
    const { 
      nombre, 
      contraseñaActual, // <-- REQUERIDO
      contraseñaNueva  // <-- Nombre usado en el frontend
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // 1. VERIFICACIÓN DE SEGURIDAD OBLIGATORIA
    if (!contraseñaActual) {
        return res.status(400).json({ error: 'Debe proporcionar la contraseña actual para realizar cambios' });
    }
    
    // Asume que tu modelo User tiene un método para verificar el hash de la contraseña
    // (Esta es la parte que requiere la librería de hash, p. ej. bcrypt)
    const isPasswordValid = await user.validPassword(contraseñaActual);
    
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    
    // 2. APLICAR CAMBIOS
    const fieldsToUpdate = {};

    // Si hay nuevo nombre, lo incluimos
    if (nombre !== undefined) {
      fieldsToUpdate.nombre = nombre;
    }

    // Si hay nueva contraseña, la incluimos (el modelo User debería hashearla antes de guardar)
    if (contraseñaNueva !== undefined) {
      fieldsToUpdate.contraseña = contraseñaNueva; // Se mapea al campo 'contraseña' del modelo
    }

    // Si no se proporcionó ni nombre ni contraseña nueva
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: 'No se encontraron campos válidos para actualizar' });
    }

    await user.update(fieldsToUpdate);

    // 3. RESPUESTA (sin contraseña)
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