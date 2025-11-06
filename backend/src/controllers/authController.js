import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_temporal_cambiar';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generar JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// POST /auth/register - Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const { email, nombre, contraseña } = req.body;

    if (!email || !nombre || !contraseña) {
      return res.status(400).json({ error: 'Faltan campos requeridos: email, nombre, contraseña' });
    }

    // Verificar si ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const existingNombre = await User.findOne({ where: { nombre } });
    if (existingNombre) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Crear usuario
    const newUser = await User.create({ 
      email, 
      nombre, 
      contraseña,
      verificado: false // Por ahora false, en fase 2 enviamos email
    });

    // Generar token
    const token = generateToken(newUser.id);

    const userData = newUser.toJSON();
    delete userData.contraseña;

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Error en registro:', error);
    const details = error.errors ? error.errors.map(e => e.message) : error.message;
    res.status(400).json({
      error: 'Error al registrar usuario',
      details
    });
  }
};

// POST /auth/login - Login de usuario
export const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    
    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await user.verifyPassword(contraseña);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(user.id);

    const userData = user.toJSON();
    delete userData.contraseña;

    res.json({ 
      message: 'Login exitoso',
      token,
      user: userData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /auth/me - Obtener usuario actual (requiere token)
export const getCurrentUser = async (req, res) => {
  try {
    // req.user viene del middleware authenticateToken
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};