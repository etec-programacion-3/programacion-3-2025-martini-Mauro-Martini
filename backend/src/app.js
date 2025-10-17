import express from 'express';
import sequelize, { testConnection } from './config/database.js';
import User from './models/User.js';
import Game from './models/Game.js';
import Comment from './models/Comment.js';
import GameStats from './models/GameStats.js';
import statsRoutes from './routes/statsRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Relaciones de la base de datos
User.hasMany(Game, { foreignKey: 'userId' });
Game.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comment);
Comment.belongsTo(User);
Game.hasMany(Comment);
Comment.belongsTo(Game);
User.belongsToMany(Game, { through: GameStats, foreignKey: 'userId', otherKey: 'gameId' });
Game.belongsToMany(User, { through: GameStats, foreignKey: 'gameId', otherKey: 'userId' });


// Crear la aplicación Express
const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());

// Rutas
app.use('/juegos', gameRoutes);
app.use('/usuarios', userRoutes);
app.use('/juegos', gameRoutes);
app.use('/stats', statsRoutes);

// Inicializar servidor
const startServer = async () => {
  console.log('🚀 Iniciando aplicación...');
  
  await testConnection();
  await sequelize.sync({ force: false });
  console.log('📊 Modelos sincronizados');
  
  app.listen(PORT, () => {
    console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`);
    console.log('✨ Rutas disponibles:');
    console.log('  GET    http://localhost:3000/juegos');
    console.log('  POST   http://localhost:3000/juegos'); 
    console.log('  GET    http://localhost:3000/juegos/:id');
    console.log('  PUT    http://localhost:3000/juegos/:id');
    console.log('  DELETE http://localhost:3000/juegos/:id');
  });
};

startServer();