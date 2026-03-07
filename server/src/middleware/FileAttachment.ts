import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  }
});