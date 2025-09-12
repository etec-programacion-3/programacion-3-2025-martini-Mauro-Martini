import sequelize, { testConnection } from './config/database.js';
import User from './models/User.js';
import Game from './models/Game.js';
import Comment from './models/Comment.js';
import GameStats from './models/GameStats.js';

User.hasMany(Game);
Game.belongsTo(User);

User.hasMany(Comment);
Comment.belongsTo(User);

Game.hasMany(Comment);
Comment.belongsTo(Game);

User.belongsToMany(Game, { through: GameStats });
Game.belongsToMany(User, { through: GameStats });

const main = async () => {
  console.log('🚀 Iniciando aplicación...');
  
  await testConnection();
  
  await sequelize.sync({ force: false });
  console.log('📊 Modelos sincronizados');
  
  console.log('✨ Prueba completada');
};

main();