import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserGameStats = sequelize.define('UserGameStats', {
  tiempoJuego: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
});

export default UserGameStats;