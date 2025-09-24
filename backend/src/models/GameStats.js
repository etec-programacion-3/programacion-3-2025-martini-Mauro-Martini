import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GameStats = sequelize.define('GameStats', {
  tiempoJuego: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
});

export default GameStats;