import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Comment = sequelize.define('Comment', {
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
  dificultad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  calidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  script: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tiempoJuego: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Tiempo de juego del usuario en ese juego (segundos recomendado)'
  }
}, {
  timestamps: true
});

export default Comment;