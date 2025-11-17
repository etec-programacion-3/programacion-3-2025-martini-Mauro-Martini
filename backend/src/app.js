import dotenv from 'dotenv';
dotenv.config(); // ← PRIMERO: Cargar variables de entorno

console.log('🔑 Variables de entorno cargadas:', {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Encontrada' : '❌ NO encontrada'
});

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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
import aiRoutes from './routes/ai.routes.js';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// RELACIONES DE LA BASE DE DATOS (Foreign Keys)
// ============================================

// 1:N - Un usuario puede subir muchos juegos
// FK: Games.userId → Users.id (ON DELETE: SET NULL)
User.hasMany(Game, { foreignKey: 'userId' });
Game.belongsTo(User, { foreignKey: 'userId' });

// 1:N - Un usuario puede hacer muchos comentarios
// FK: Comments.userId → Users.id (ON DELETE: CASCADE)
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// 1:N - Un juego puede tener muchos comentarios
// FK: Comments.gameId → Games.id (ON DELETE: CASCADE)
Game.hasMany(Comment, { foreignKey: 'gameId' });
Comment.belongsTo(Game, { foreignKey: 'gameId' });

// N:M - Relación muchos a muchos entre Users y Games a través de GameStats
// FK compuesta: GameStats.(userId, gameId) con restricción UNIQUE
User.belongsToMany(Game, { through: GameStats, foreignKey: 'userId', otherKey: 'gameId' });
Game.belongsToMany(User, { through: GameStats, foreignKey: 'gameId', otherKey: 'userId' });

// 1:N - Relaciones directas con GameStats
// FK: GameStats.userId → Users.id (ON DELETE: CASCADE)
User.hasMany(GameStats, { foreignKey: 'userId' });
GameStats.belongsTo(User, { foreignKey: 'userId' });

// FK: GameStats.gameId → Games.id (ON DELETE: CASCADE)
Game.hasMany(GameStats, { foreignKey: 'gameId' });
GameStats.belongsTo(Game, { foreignKey: 'gameId' });

// ⚠️ DEPENDENCIA FUNCIONAL: Comments → GameStats
// FK compuesta implícita: Comments.(userId, gameId) → GameStats.(userId, gameId)
// Un comentario solo puede existir si hay estadísticas previas del usuario en ese juego
// El campo Comments.tiempoJuego es un snapshot de GameStats.tiempoJuego al momento de comentar
Comment.belongsTo(GameStats, { 
  foreignKey: 'userId',
  targetKey: 'userId',
  constraints: false // La FK compuesta se maneja en SQL, no en Sequelize
});
Comment.belongsTo(GameStats, { 
  foreignKey: 'gameId',
  targetKey: 'gameId',
  constraints: false
});

// Crear la aplicación Express
const app = express();
const PORT = 3001;

// Habilitar CORS antes de las rutas
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu frontend (ajusta el puerto según Vite)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/juegos-ejecutables', express.static(path.join(__dirname, '../juegos-ejecutables')));

// Rutas
app.use('/usuarios', userRoutes);
app.use('/juegos', gameRoutes);
app.use('/stats', statsRoutes);
app.use('/comentarios', commentRoutes);
app.use('/auth', authRoutes);
app.use('/ai', aiRoutes);

// Inicializar servidor
const startServer = async () => {
  console.log('🚀 Iniciando aplicación...');
  
  await testConnection();
  await sequelize.sync({ force: false });
  console.log('📊 Modelos sincronizados');
  
  app.listen(PORT, () => {
    console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`);
    console.log('✨ Rutas disponibles:');

    // --- Autenticación (Auth) 🔐 ---
    console.log(`  POST   http://localhost:${PORT}/auth/register`);
    console.log(`  POST   http://localhost:${PORT}/auth/login`);
    console.log(`  GET    http://localhost:${PORT}/auth/me`); // Requiere JWT

    // --- Usuarios 🧑‍💻 ---
    console.log(`  POST   http://localhost:${PORT}/usuarios`);
    console.log(`  GET    http://localhost:${PORT}/usuarios`);
    console.log(`  GET    http://localhost:${PORT}/usuarios/:id`);
    console.log(`  PUT    http://localhost:${PORT}/usuarios/:id`);
    console.log(`  DELETE http://localhost:${PORT}/usuarios/:id`);

    // --- Juegos 🎮 ---
    // Nota: PUT/DELETE requieren userId en body/query para checkAuthor
    console.log(`  POST   http://localhost:${PORT}/juegos`); // Soporta JSON y multipart/form-data (archivos)
    console.log(`  GET    http://localhost:${PORT}/juegos`);
    console.log(`  GET    http://localhost:${PORT}/juegos/:id`);
    console.log(`  PUT    http://localhost:${PORT}/juegos/:id`); 
    console.log(`  DELETE http://localhost:${PORT}/juegos/:id`); 

    // --- Estadísticas (Stats) 📊 ---
    console.log(`  POST   http://localhost:${PORT}/stats/:gameId`); // Actualizar stats de un juego
    console.log(`  GET    http://localhost:${PORT}/stats/:gameId`); // Obtener stats del juego

    // --- Comentarios 💬 ---
    // Nota: PUT/DELETE requieren userId en body/query
    console.log(`  POST   http://localhost:${PORT}/comentarios`);
    console.log(`  GET    http://localhost:${PORT}/comentarios/game/:gameId`); // Obtener comentarios por juego
    console.log(`  GET    http://localhost:${PORT}/comentarios/:id`); // Obtener comentario por ID
    console.log(`  PUT    http://localhost:${PORT}/comentarios/:id`);
    console.log(`  DELETE http://localhost:${PORT}/comentarios/:id`);

    // --- Otros (AI y Archivos Estáticos) ---
    console.log(`  GET    http://localhost:${PORT}/ai/recomendaciones`);
    console.log(`  📁     http://localhost:${PORT}/uploads (archivos estáticos)`);
    console.log(`  🎮     http://localhost:${PORT}/juegos-ejecutables (juegos HTML5)`);
  });
};

startServer();