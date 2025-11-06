import { Model, DataTypes } from 'sequelize';
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
    unique: {
      msg: "Este nombre ya está en uso"
    },
    validate: {
      len: {
        args: [3, 255],
        msg: "El nombre debe tener al menos 3 caracteres"
      }
    }
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [6, 100] }
  },
  verificado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Para verificación de email en fase 2'
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