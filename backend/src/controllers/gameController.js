import Game from '../models/Game.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import GameStats from '../models/GameStats.js';
import { fn, col } from 'sequelize';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /juegos - Obtener todos los juegos con promedio de dificultad y calidad y total tiempo
export const getAllGames = async (req, res) => {
  try {
    const games = await Game.findAll({
      attributes: {
        include: [
          [fn('ROUND', fn('AVG', col('Comments.dificultad')), 2), 'avgDificultad'],
          [fn('ROUND', fn('AVG', col('Comments.calidad')), 2), 'avgCalidad'],
          [fn('COALESCE', fn('SUM', col('GameStats.tiempoJuego')), 0), 'totalTiempo']
        ]
      },
      include: [
        { model: User, attributes: ['id', 'nombre'] },
        { model: Comment, attributes: [] },
        { model: GameStats, attributes: [] }
      ],
      group: ['Game.id', 'User.id', 'User.nombre']
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /juegos/:id - Obtener un juego específico con promedios y total tiempo
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;

    const games = await Game.findAll({
      where: { id: Number(id) },
      attributes: {
        include: [
          [fn('ROUND', fn('AVG', col('Comments.dificultad')), 2), 'avgDificultad'],
          [fn('ROUND', fn('AVG', col('Comments.calidad')), 2), 'avgCalidad'],
          [fn('COALESCE', fn('SUM', col('GameStats.tiempoJuego')), 0), 'totalTiempo']
        ]
      },
      include: [
        { model: User, attributes: ['id', 'nombre'] },
        { model: Comment, attributes: [] },
        { model: GameStats, attributes: [] }
      ],
      group: ['Game.id', 'User.id', 'User.nombre']
    });

    const game = games[0] || null;

    if (!game) return res.status(404).json({ error: 'Juego no encontrado' });

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /juegos - Crear nuevo juego
export const createGame = async (req, res) => {
  try {
    console.log('📝 Datos recibidos:', req.body);
    console.log('📁 Archivos recibidos:', req.files);
    console.log('👤 Usuario autenticado:', req.user);
    
    const { titulo, descripcion } = req.body;
    const userId = req.user.id; // Obtener del token JWT
    
    // Validaciones
    if (!titulo) {
      return res.status(400).json({ error: 'El título es requerido' });
    }
    
    // Obtener archivos subidos
    const archivo = req.files && req.files['archivo'] ? req.files['archivo'][0] : null;
    const imagen = req.files && req.files['imagen'] ? req.files['imagen'][0] : null;
    
    const rutaArchivos = archivo ? archivo.filename : null;
    const rutaImagen = imagen ? imagen.filename : null;

    console.log('✅ Creando juego con:', { titulo, descripcion, userId, rutaArchivos, rutaImagen });

    // Crear el juego en la base de datos
    const newGame = await Game.create({
      titulo,
      descripcion,
      rutaArchivos,
      rutaImagen,
      userId
    });

    // Descomprimir el ZIP si existe
    if (archivo) {
      try {
        const zipPath = path.join(__dirname, '../../uploads', archivo.filename);
        const zip = new AdmZip(zipPath);
        const extractPath = path.join(__dirname, '../../juegos-ejecutables', String(newGame.id));
        
        // Crear carpeta si no existe
        if (!fs.existsSync(extractPath)) {
          fs.mkdirSync(extractPath, { recursive: true });
        }
        
        // Descomprimir
        zip.extractAllTo(extractPath, true);
        
        // Buscar index.html en cualquier subcarpeta
        let indexPath = 'index.html';
        const findIndexHtml = (dir, basePath = '') => {
          const files = fs.readdirSync(path.join(extractPath, dir));
          for (const file of files) {
            const fullPath = path.join(dir, file);
            const absolutePath = path.join(extractPath, fullPath);
            
            if (fs.statSync(absolutePath).isDirectory()) {
              const found = findIndexHtml(fullPath, basePath);
              if (found) return found;
            } else if (file === 'index.html') {
              return fullPath;
            }
          }
          return null;
        };
        
        const foundIndex = findIndexHtml('');
        if (foundIndex) {
          indexPath = foundIndex.replace(/\\/g, '/'); // Normalizar path para URLs
          console.log(`📍 index.html encontrado en: ${indexPath}`);
        }
        
        // Actualizar el juego con la ruta de la carpeta y la ruta del index
        await newGame.update({
          rutaCarpetaJuego: `${newGame.id}/${indexPath.replace('index.html', '')}`
        });
        
        console.log(`Juego ${newGame.id} descomprimido en: ${extractPath}`);
      } catch (zipError) {
        console.error('Error al descomprimir el juego:', zipError);
        // No fallar la creación del juego si falla la descompresión
      }
    }

    res.status(201).json(newGame);
  } catch (error) {
    console.error('❌ Error completo al crear el juego:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(400).json({ 
      error: 'Error al crear el juego',
      details: error.message,
      name: error.name
    });
  }
};

// PUT /juegos/:id - Actualizar juego
export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;
    
    const archivo = req.files && req.files['archivo'] ? req.files['archivo'][0] : null;
    const imagen = req.files && req.files['imagen'] ? req.files['imagen'][0] : null;
    
    const rutaArchivos = archivo ? archivo.filename : undefined;
    const rutaImagen = imagen ? imagen.filename : undefined;

    const game = await Game.findByPk(id);

    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    // Actualizar el juego
    await game.update({
      titulo,
      descripcion,
      ...(rutaArchivos && { rutaArchivos }),
      ...(rutaImagen && { rutaImagen })
    });

    // Si hay un nuevo archivo ZIP, descomprimirlo
    if (archivo) {
      try {
        const zipPath = path.join(__dirname, '../../uploads', archivo.filename);
        const zip = new AdmZip(zipPath);
        const extractPath = path.join(__dirname, '../../juegos-ejecutables', String(game.id));
        
        // Eliminar carpeta anterior si existe
        if (fs.existsSync(extractPath)) {
          fs.rmSync(extractPath, { recursive: true, force: true });
        }
        
        // Crear carpeta nueva
        fs.mkdirSync(extractPath, { recursive: true });
        
        // Descomprimir
        zip.extractAllTo(extractPath, true);
        
        // Buscar index.html en cualquier subcarpeta
        let indexPath = 'index.html';
        const findIndexHtml = (dir) => {
          const files = fs.readdirSync(path.join(extractPath, dir));
          for (const file of files) {
            const fullPath = path.join(dir, file);
            const absolutePath = path.join(extractPath, fullPath);
            
            if (fs.statSync(absolutePath).isDirectory()) {
              const found = findIndexHtml(fullPath);
              if (found) return found;
            } else if (file === 'index.html') {
              return fullPath;
            }
          }
          return null;
        };
        
        const foundIndex = findIndexHtml('');
        if (foundIndex) {
          indexPath = foundIndex.replace(/\\/g, '/');
          console.log(`📍 index.html encontrado en: ${indexPath}`);
        }
        
        // Actualizar la ruta
        await game.update({
          rutaCarpetaJuego: `${game.id}/${indexPath.replace('index.html', '')}`
        });
        
        console.log(`Juego ${game.id} actualizado y descomprimido`);
      } catch (zipError) {
        console.error('Error al descomprimir el juego actualizado:', zipError);
      }
    }

    res.json(game);
  } catch (error) {
    console.error('Error al actualizar el juego:', error);
    res.status(400).json({ error: 'Error al actualizar el juego' });
  }
};

// DELETE /juegos/:id - Eliminar juego
export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await Game.findByPk(id);
    
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    // Eliminar archivo ZIP del filesystem
    if (game.rutaArchivos) {
      try {
        const filePath = path.join(__dirname, '../../uploads', String(game.rutaArchivos));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Archivo ZIP eliminado:', filePath);
        }
      } catch (fsErr) {
        console.error('Error al eliminar archivo ZIP:', fsErr);
      }
    }

    // Eliminar imagen del filesystem
    if (game.rutaImagen) {
      try {
        const imagePath = path.join(__dirname, '../../uploads', String(game.rutaImagen));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Imagen eliminada:', imagePath);
        }
      } catch (fsErr) {
        console.error('Error al eliminar imagen:', fsErr);
      }
    }

    // Eliminar carpeta del juego descomprimido
    if (game.rutaCarpetaJuego) {
      try {
        const extractPath = path.join(__dirname, '../../juegos-ejecutables', String(game.rutaCarpetaJuego));
        if (fs.existsSync(extractPath)) {
          fs.rmSync(extractPath, { recursive: true, force: true });
          console.log('Carpeta del juego eliminada:', extractPath);
        }
      } catch (fsErr) {
        console.error('Error al eliminar carpeta del juego:', fsErr);
      }
    }
    
    await game.destroy();
    
    res.json({ message: 'Juego eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el juego:', error);
    res.status(500).json({ error: 'Error al eliminar el juego' });
  }
};