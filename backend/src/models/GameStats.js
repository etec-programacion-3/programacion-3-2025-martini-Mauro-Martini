// ...existing code...
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
  tiempoJuego: { // tiempo acumulado del usuario en ese juego (recomiendo segundos u horas según tu decisión)
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Tiempo de uso (segundos recomendados para precisión)'
  }
}, {
  indexes: [
    { unique: true, fields: ['userId', 'gameId'] }
  ]
});

export default GameStats;
// ...existing code...