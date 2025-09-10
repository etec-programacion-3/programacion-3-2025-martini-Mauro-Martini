import sequelize, { testConnection } from './config/database.js';
import { User, Game } from './models/index.js';

const main = async () => {
  console.log('🚀 Iniciando aplicación...');
  
  await testConnection();
  
  await sequelize.sync({ force: false });
  console.log('📊 Modelos sincronizados');
  
  console.log('✨ Prueba completada');
};

main();