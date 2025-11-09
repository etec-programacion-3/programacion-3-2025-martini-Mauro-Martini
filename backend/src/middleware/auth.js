import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_temporal_cambiar';

// Middleware para verificar token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obtener usuario de la BD
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['contraseña'] }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Agregar usuario al request (para /auth/me)
    req.user = user;
    
    // CORRECCIÓN FALTANTE: Agregar ID al request (para gameController)
    req.userId = user.id; 
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware opcional - continúa aunque no haya token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['contraseña'] }
      });
      req.user = user;
      
      // CORRECIÓN FALTANTE: Agregar ID al request (para consistencia)
      req.userId = user.id; 
    }
  } catch (error) {
    // Ignorar errores, continuar sin usuario
  }
  next();
};