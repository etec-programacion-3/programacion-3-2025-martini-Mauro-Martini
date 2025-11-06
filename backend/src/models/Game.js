import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Game = sequelize.define('Game', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rutaArchivos: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rutaCarpetaJuego: {
  type: DataTypes.STRING,
  allowNull: true,
  comment: 'Ruta de la carpeta donde se descomprimió el juego'
  },
  rutaImagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  avgDificultad: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  avgCalidad: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true
});

export default Game;