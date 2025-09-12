import sequelize from './config/database.js';
import User from './models/User.js';
import Game from './models/Game.js';
import Comment from './models/Coment.js';
import GameStats from './models/GameStats.js';

const test = async () => {
  // Borra todas las tablas y vuelve a crearlas
  await sequelize.sync({ force: true });

  // Crear usuario
  const user = await User.create({
    googleId: 'google456',
    telefono: '87654321',
    nombre: 'Nuevo Usuario'
  });

  // Crear juego
  const game = await Game.create({
    titulo: 'Nuevo Juego',
    descripcion: 'Otra descripción de prueba.',
    rutaArchivos: '/nueva/ruta/al/archivo'
  });

  // Relacionar usuario y juego con horas jugadas
  await user.addGame(game, { through: { tiempoJuego: 10 } });

  // Crear comentario
  const comment = await Comment.create({
    Calidad: 5,
    Dificultad: 2,
    UserId: user.id,
    GameId: game.id
  });

  // Consultar datos
  const result = await User.findAll({
    include: [
      { model: Game, through: { attributes: ['tiempoJuego'] } },
      { model: Comment }
    ]
  });

  console.log(JSON.stringify(result, null, 2));
};

test();