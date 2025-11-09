import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const isZip = (file) => (
  file.mimetype === 'application/zip' ||
  file.mimetype === 'application/x-zip-compressed' ||
  path.extname(file.originalname).toLowerCase() === '.zip'
);

const isImage = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const m = file.mimetype.toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) || m.startsWith('image/');
};

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'archivo') {
    if (isZip(file)) return cb(null, true);
    return cb(new Error('Solo se permite .zip en el campo "archivo"'), false);
  }
  if (file.fieldname === 'imagen') {
    if (isImage(file)) return cb(null, true);
    return cb(new Error('Solo se permiten imágenes (png/jpg/jpeg/webp) en el campo "imagen"'), false);
  }
  return cb(new Error('Campo de archivo no soportado'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024
  }
});

export default upload;