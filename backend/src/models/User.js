import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [8, 15]
    }
  },
  
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  }
});

export default User;