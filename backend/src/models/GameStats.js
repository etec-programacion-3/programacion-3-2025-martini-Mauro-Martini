import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GameStats = sequelize.define('GameStats', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Games', key: 'id' }
  },
  tiempoJuego: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
    comment: 'Tiempo acumulado de juego en horas (enteras). Considerar segundos para mayor precisión.'
  }
}, {
  indexes: [
    { unique: true, fields: ['userId', 'gameId'] }
  ]
});

export default GameStats;