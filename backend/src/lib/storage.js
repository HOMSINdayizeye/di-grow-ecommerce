/**
 * Where uploaded pictures live.
 *
 *  - UPLOAD_STORAGE=mongo (default): the file is saved in the `media` collection and served by
 *    GET /api/uploads/m/:id/:name. Works on any host, including ones without a persistent disk.
 *  - UPLOAD_STORAGE=disk: the file is written under backend/uploads and served by express.static.
 *
 * Both return the URL that is stored on the product / category / post.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { env } from '../config/env.js';
import { UPLOADS_DIR } from '../config/paths.js';
import { Media } from '../models/Media.js';
import { logger } from './logger.js';

export const storageKind = env.uploadStorage; // 'mongo' | 'disk'

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

/** Only letters, digits, dashes, underscores and slashes in folders and names, so a client can never pick a path. */
const safeSegment = (s) => String(s || '').replace(/\.\./g, '').replace(/[^a-zA-Z0-9/_-]+/g, '-').replace(/^[/-]+|[/-]+$/g, '');

/**
 * saveImage({ buffer, folder: 'products', filename: '123-abc-name.jpg' }) -> stored URL
 */
export async function saveImage({ buffer, folder, filename }) {
  const dir = safeSegment(folder) || 'misc';
  const ext = (path.extname(filename) || '.jpg').toLowerCase();
  const base = safeSegment(path.basename(filename, path.extname(filename))) || 'image';
  const name = `${base}${ext}`;

  if (storageKind === 'mongo') {
    const doc = await Media.create({
      folder: dir,
      filename: name,
      contentType: MIME_BY_EXT[ext] || 'application/octet-stream',
      size: buffer.length,
      data: buffer,
    });
    return `${env.uploadsBaseUrl}/m/${doc._id}/${name}`;
  }

  const target = path.join(UPLOADS_DIR, dir);
  await fs.mkdir(target, { recursive: true });
  await fs.writeFile(path.join(target, name), buffer);
  return `${env.uploadsBaseUrl}/${dir}/${name}`;
}

/** Remove everything under a folder (catalogue import pictures that are no longer needed). */
export async function deleteFolder(folder) {
  const dir = safeSegment(folder);
  if (!dir) return;
  try {
    await Media.deleteMany({ folder: dir });
    await fs.rm(path.join(UPLOADS_DIR, dir), { recursive: true, force: true });
  } catch (err) {
    logger.warn(`Could not delete upload folder ${dir}: ${err.message}`);
  }
}

const UPLOAD_RE = /^(?:https?:\/\/[^/]+)?\/api\/uploads\/(.+)$/i;

/**
 * Turn a stored upload URL into one the browser can load from wherever the frontend is hosted:
 * "/api/uploads/x.jpg" (or the same behind another host) becomes "<UPLOADS_BASE_URL>/x.jpg".
 * Anything else (placeholders, other sites) is returned untouched.
 */
export function publicUrl(stored) {
  if (!stored || typeof stored !== 'string') return stored;
  const m = stored.match(UPLOAD_RE);
  if (!m) return stored;
  return `${env.uploadsBaseUrl}/${m[1]}`;
}

/** Local file behind a stored upload URL, or null when it is not a file on this disk (database media included). */
export function localPathFor(stored) {
  const m = String(stored || '').match(UPLOAD_RE);
  if (!m || m[1].startsWith('m/')) return null;
  return path.join(UPLOADS_DIR, ...m[1].split('/'));
}

export function describeStorage() {
  return storageKind === 'mongo' ? `MongoDB (media collection), served from ${env.uploadsBaseUrl}/m/...` : `local disk, served from ${env.uploadsBaseUrl}`;
}
