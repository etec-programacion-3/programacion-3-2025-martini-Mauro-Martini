import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true, len: [2, 50] }
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [6, 100] }
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.contraseña) {
        user.contraseña = await bcrypt.hash(user.contraseña, SALT_ROUNDS);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('contraseña')) {
        user.contraseña = await bcrypt.hash(user.contraseña, SALT_ROUNDS);
      }
    }
  }
});

User.prototype.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.contraseña);
};

export default User;