import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { ApiError } from '../lib/ApiError.js';
import { UPLOADS_DIR } from '../config/paths.js';

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const FOLDERS = new Set(['products', 'categories', 'blog', 'misc']);

/** Only letters/numbers in the folder so a client can never escape the uploads root. */
export const safeFolder = (f) => (FOLDERS.has(String(f || '')) ? String(f) : 'products');

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const dir = path.join(UPLOADS_DIR, safeFolder(req.body?.folder));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = ALLOWED[file.mimetype] || path.extname(file.originalname).toLowerCase() || '.img';
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    cb(null, `${Date.now()}-${crypto.randomBytes(3).toString('hex')}-${base || 'image'}${ext}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED[file.mimetype]) return cb(ApiError.badRequest('Only JPG, PNG, WEBP, GIF or SVG images are allowed'));
    return cb(null, true);
  },
}).single('image');

/** Catalogue PDFs are kept in memory and parsed straight away; nothing is stored until it is read. */
export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname || '');
    if (!isPdf) return cb(ApiError.badRequest('Upload a PDF file'));
    return cb(null, true);
  },
}).single('catalog');
