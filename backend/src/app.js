import express from 'express';
import sequelize, { testConnection } from './config/database.js';
import User from './models/User.js';
import Game from './models/Game.js';
import Comment from './models/Comment.js';
import GameStats from './models/GameStats.js';
import statsRoutes from './routes/statsRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import authRoutes from './routes/authRoutes.js';


// Relaciones de la base de datos
User.hasMany(Game, { foreignKey: 'userId' });
Game.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Game.hasMany(Comment, { foreignKey: 'gameId' });
Comment.belongsTo(Game, { foreignKey: 'gameId' });

User.belongsToMany(Game, { through: GameStats, foreignKey: 'userId', otherKey: 'gameId' });
Game.belongsToMany(User, { through: GameStats, foreignKey: 'gameId', otherKey: 'userId' });

User.hasMany(GameStats, { foreignKey: 'userId' });
GameStats.belongsTo(User, { foreignKey: 'userId' });
Game.hasMany(GameStats, { foreignKey: 'gameId' });
GameStats.belongsTo(Game, { foreignKey: 'gameId' });

// Crear la aplicación Express
const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // permitir form-urlencoded si hace falta

// Rutas
app.use('/usuarios', userRoutes);
app.use('/juegos', gameRoutes);
app.use('/stats', statsRoutes);
app.use('/comentarios', commentRoutes);
app.use('/auth', authRoutes);

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