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

// Helper para obtener la ruta absoluta del archivo en /uploads
const getUploadsPath = (filename) => path.join(__dirname, '../../uploads', filename); 
// Helper para obtener la ruta absoluta de la carpeta en /juegos-ejecutables
const getExecutablesPath = (folderName) => path.join(__dirname, '../../juegos-ejecutables', folderName);

// FUNCIÓN RECURSIVA PARA ENCONTRAR INDEX.HTML
const findIndexHtmlPath = (extractDir, currentDir = '') => {
    const fullPath = path.join(extractDir, currentDir);
    if (!fs.existsSync(fullPath)) return null;

    const files = fs.readdirSync(fullPath);

    for (const file of files) {
        const filePath = path.join(currentDir, file);
        const absolutePath = path.join(extractDir, filePath);
        const stat = fs.statSync(absolutePath);

        if (stat.isDirectory()) {
            const found = findIndexHtmlPath(extractDir, filePath);
            if (found) return found;
        } else if (file.toLowerCase() === 'index.html') {
            return filePath; // Devuelve la ruta relativa a extractDir
        }
    }
    return null;
};
// ====================================================================


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

// Obtener todos los juegos subidos por un usuario
export const getGamesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const games = await Game.findAll({
      where: {
        UserId: userId,
      },
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
    console.error('Error al obtener juegos por ID de usuario:', error);
    res.status(500).json({ error: 'Error al obtener los juegos del usuario', details: error.message });
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
  // CORRECCIÓN: Usar req.user.id (asumiendo que authenticateToken lo pone en req.user)
  const UserId = req.user?.id; 
  const { titulo, descripcion } = req.body;
  
  if (!UserId) { 
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  const archivo = req.files && req.files['archivo'] ? req.files['archivo'][0] : null;
  const imagen = req.files && req.files['imagen'] ? req.files['imagen'][0] : null;
    
  if (!archivo || !imagen) {
    return res.status(400).json({ error: 'Faltan los archivos: juego ZIP y/o imagen de portada' });
  }

  // Guardamos solo el filename de Multer en la DB
  const rutaArchivosDB = archivo.filename;
  const rutaImagenDB = imagen.filename;
  
  let rutaCarpetaJuego = null; 
  let extractDir = null;
  let newGame = null; 
  
  const zipPathAbs = getUploadsPath(archivo.filename);
  
  try {
    // 1. CREAR REGISTRO DE DB PRIMERO para obtener el ID
    newGame = await Game.create({
      titulo,
      descripcion,
      rutaArchivos: rutaArchivosDB, // Solo filename
      rutaImagen: rutaImagenDB,     // Solo filename
      userId: UserId 
    });
    
    // 2. Definir la ruta de la carpeta usando el ID del juego
    rutaCarpetaJuego = String(newGame.id);
    extractDir = getExecutablesPath(rutaCarpetaJuego);

    // 3. Descomprimir el archivo ZIP
    const zip = new AdmZip(zipPathAbs);
    zip.extractAllTo(extractDir, true);

    // 4. VALIDACIÓN FLEXIBLE: Buscar index.html
    const indexPath = findIndexHtmlPath(extractDir);
    
    if (!indexPath) {
        throw new Error('El archivo ZIP debe contener un index.html en alguna de sus carpetas');
    }
    
    // 5. Actualizar la ruta ejecutable en la DB
    const rutaEjecutable = path.join(rutaCarpetaJuego, path.dirname(indexPath));
    
    await newGame.update({
        rutaCarpetaJuego: rutaEjecutable.replace(/\\/g, '/') // Normalizar para URL
    });
    
    // 6. Recargar el juego con la asociación del Usuario
    const gameWithUser = await Game.findByPk(newGame.id, {
        include: [{ model: User, attributes: ['id', 'nombre'] }]
    });

    res.status(201).json(gameWithUser);
    
  } catch (error) {
    console.error('❌ Error completo al crear el juego:', error);
    
    const errorMessage = error.message.includes('index.html') 
        ? error.message 
        : 'Error al crear el juego';

    // Limpieza exhaustiva en caso de fallo
    try {
      if (newGame && newGame.id) {
          await newGame.destroy();
      }
      const zipFinalPath = getUploadsPath(rutaArchivosDB);
      if (fs.existsSync(zipFinalPath)) fs.unlinkSync(zipFinalPath);
      const imageFinalPath = getUploadsPath(rutaImagenDB);
      if (fs.existsSync(imageFinalPath)) fs.unlinkSync(imageFinalPath);
      if (rutaCarpetaJuego) {
        const dir = getExecutablesPath(rutaCarpetaJuego);
        if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch (cleanError) {
      console.error('Error en la limpieza de archivos tras fallo:', cleanError);
    }

    res.status(400).json({ error: errorMessage, details: error.message });
  }
};

// PUT /juegos/:id - Actualizar juego
export const updateGame = async (req, res) => {
  let rutaCarpetaJuegoNueva = null;
  let archivoNuevo = null;
  let imagenNueva = null;
  let extractDir = null;

  try {
    // 1. OBTENER ID DE USUARIO Y DATOS DEL BODY
    // CORRECCIÓN: Usamos req.user.id (puesto por authenticateToken)
    const userId = req.user?.id; 
    const { titulo, descripcion } = req.body;

    // 2. OBTENER JUEGO DESDE EL MIDDLEWARE
    // SOLUCIÓN: Usamos el juego que 'checkAuthor' ya encontró y puso en req.game
    const game = req.game;

    // --- Las siguientes líneas ya no son necesarias ---
    // const { id } = req.params;
    // const game = await Game.findByPk(id);
    // if (!game) { return res.status(404).json({ error: 'Juego no encontrado' }); }
    // if (game.UserId !== userId) { return res.status(403).json({ error: 'No tienes permiso para actualizar este juego' }); }
    // --- Fin de líneas eliminadas ---

    const fieldsToUpdate = {};
    archivoNuevo = req.files?.archivo ? req.files.archivo[0] : null;
    imagenNueva = req.files?.imagen ? req.files.imagen[0] : null;

    // Actualizar campos de texto
    if (titulo !== undefined) fieldsToUpdate.titulo = titulo;
    if (descripcion !== undefined) fieldsToUpdate.descripcion = descripcion;

    // Manejar subida de nuevo archivo ZIP (opcional)
    if (archivoNuevo) {
      const rutaArchivosNueva = archivoNuevo.filename; 
      rutaCarpetaJuegoNueva = String(game.id); // Reutilizar el ID del juego
      extractDir = getExecutablesPath(rutaCarpetaJuegoNueva);
      const zipPathAbs = getUploadsPath(archivoNuevo.filename);

      // 1. ELIMINACIÓN DEL ARCHIVO ANTIGUO y CARPETA ANTIGUA
      if (game.rutaArchivos) {
        const oldZipPath = getUploadsPath(game.rutaArchivos);
        if (fs.existsSync(oldZipPath)) fs.unlinkSync(oldZipPath);
      }
      if (game.rutaCarpetaJuego) {
        const baseDir = game.rutaCarpetaJuego.split(path.sep)[0];
        const oldExtractPath = getExecutablesPath(baseDir);
        if (fs.existsSync(oldExtractPath)) fs.rmSync(oldExtractPath, { recursive: true, force: true });
      }

      // 2. Descomprimir el archivo ZIP nuevo
      const zip = new AdmZip(zipPathAbs);
      zip.extractAllTo(extractDir, true);
      
      // 3. Verificar index.html (FLEXIBLE)
      const indexPath = findIndexHtmlPath(extractDir);
      if (!indexPath) {
        throw new Error('El nuevo archivo ZIP debe contener un index.html en alguna de sus carpetas');
      }

      // 4. Actualizar campos de la DB
      const rutaEjecutable = path.join(rutaCarpetaJuegoNueva, path.dirname(indexPath));
      fieldsToUpdate.rutaArchivos = rutaArchivosNueva;
      fieldsToUpdate.rutaCarpetaJuego = rutaEjecutable.replace(/\\/g, '/'); 
    }

    // Manejar subida de nueva imagen (opcional)
    if (imagenNueva) {
      const rutaImagenNueva = imagenNueva.filename;

      // 1. ELIMINACIÓN DE LA IMAGEN ANTIGUA
      if (game.rutaImagen) {
        const oldImagePath = getUploadsPath(game.rutaImagen);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      
      // 2. Actualizar campo de la DB
      fieldsToUpdate.rutaImagen = rutaImagenNueva;
    }
    
    // Si no hay campos para actualizar (ni texto ni archivos)
    if (Object.keys(fieldsToUpdate).length === 0 && !archivoNuevo && !imagenNueva) {
        return res.status(400).json({ error: 'No se encontraron campos válidos o nuevos archivos para actualizar' });
    }

    // Aplicar la actualización en la DB
    await game.update(fieldsToUpdate);

    // Recargar el juego para obtener la información actualizada CON el usuario
    const updatedGame = await Game.findByPk(game.id, {
        include: [{ model: User, attributes: ['id', 'nombre'] }]
    });

    res.json(updatedGame);
  } catch (error) {
    console.error('Error al actualizar juego:', error);
    
    const errorMessage = error.message.includes('index.html') 
        ? error.message 
        : 'Error al actualizar juego';
        
    try {
        if (extractDir && fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
    } catch (cleanError) {
        console.error('Error en la limpieza tras fallo de actualización:', cleanError);
    }
        
    res.status(400).json({ error: errorMessage, details: error.message });
  }
};

// DELETE /juegos/:id - Eliminar juego
export const deleteGame = async (req, res) => {
  try {
    // SOLUCIÓN: Usamos el juego que 'checkAuthor' ya encontró y puso en req.game
    const game = req.game;

    // --- Las siguientes líneas ya no son necesarias ---
    // const { id } = req.params;
    // const userId = req.userId; // o req.user.id
    // const game = await Game.findByPk(id);
    // if (!game) { return res.status(404).json({ error: 'Juego no encontrado' }); }
    // if (game.UserId !== userId) { return res.status(403).json({ error: 'No tienes permiso para eliminar este juego' }); }
    // --- Fin de líneas eliminadas ---

    // 1. ELIMINAR ARCHIVO ZIP
    if (game.rutaArchivos) {
      try {
        const filePath = getUploadsPath(game.rutaArchivos);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (fsErr) {
        console.error('Error al eliminar archivo ZIP:', fsErr);
      }
    }

    // 2. ELIMINAR IMAGEN
    if (game.rutaImagen) {
      try {
        const imagePath = getUploadsPath(game.rutaImagen);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      } catch (fsErr) {
        console.error('Error al eliminar imagen:', fsErr);
      }
    }

    // 3. ELIMINAR CARPETA DESCOMPRIMIDA
    if (game.rutaCarpetaJuego) {
      try {
        const baseDir = game.rutaCarpetaJuego.split(path.sep)[0];
        const extractPath = getExecutablesPath(baseDir); 
        
        if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });
      } catch (fsErr) {
        console.error('Error al eliminar carpeta del juego:', fsErr);
      }
    }
    
    // 4. ELIMINAR REGISTRO DE DB
    await game.destroy();
    
    res.json({ message: 'Juego eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el juego:', error);
    res.status(500).json({ error: 'Error al eliminar el juego' });
  }
};