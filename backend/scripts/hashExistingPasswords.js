import sequelize from '../src/config/database.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

const run = async () => {
  await sequelize.authenticate();
  const users = await User.findAll();
  for (const u of users) {
    const pass = u.contraseña || '';
    // heurística: si ya está hasheada bcrypt suele tener $2a$ o longitud >= 60
    if (!pass.startsWith('$2') || pass.length < 50) {
      const hashed = await bcrypt.hash(pass, SALT_ROUNDS);
      u.contraseña = hashed;
      await u.save();
      console.log('Hasheado user', u.id);
    }
  }
  process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); });