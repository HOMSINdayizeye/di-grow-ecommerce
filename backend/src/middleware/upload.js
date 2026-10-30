import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { ApiError } from '../lib/ApiError.js';

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const FOLDERS = new Set(['products', 'categories', 'blog', 'misc']);

/** Only known folder names, so a client can never escape the uploads root. */
export const safeFolder = (f) => (FOLDERS.has(String(f || '')) ? String(f) : 'products');

/** Unique, URL-safe file name that still hints at the original: 1700000000000-ab12cd-my-photo.jpg */
export function makeFilename(originalname, mimetype) {
  const ext = ALLOWED[mimetype] || path.extname(originalname || '').toLowerCase() || '.img';
  const base = path
    .basename(originalname || 'image', path.extname(originalname || ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${Date.now()}-${crypto.randomBytes(3).toString('hex')}-${base || 'image'}${ext}`;
}

/** Images are kept in memory and handed to lib/storage.js, which writes to disk or Cloudinary. */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
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
