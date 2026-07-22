import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const carpetaDestino = path.join(__dirname, '../../uploads/comprobantes');

if (!fs.existsSync(carpetaDestino)) {
  fs.mkdirSync(carpetaDestino, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, carpetaDestino);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, `comprobante-${Date.now()}${extension}`);
  }
});

export const uploadMiddleware = multer({ storage });