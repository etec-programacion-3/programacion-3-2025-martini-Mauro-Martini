import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Coment = sequelize.define('Coment', {
  Calidad: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 1,
      max: 5
    }
  },
    Dificultad: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 1,
      max: 5
    }
  }
});

export default Coment;