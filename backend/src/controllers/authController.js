import User from '../models/User.js';

export const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await user.verifyPassword(contraseña);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    // aquí crear token/session (JWT, etc.)
    res.json({ message: 'Autenticado', userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};