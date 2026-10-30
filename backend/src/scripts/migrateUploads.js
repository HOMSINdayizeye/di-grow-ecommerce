/**
 * Move pictures that live as files in backend/uploads (stored as "/api/uploads/<folder>/<file>")
 * into the database, and rewrite the URLs saved on products, categories, posts and imports.
 *
 *   npm run migrate:uploads --workspace=backend
 *
 * Needs the local files, so run it on the machine where the uploads were made, with MONGODB_URI
 * pointing at the database the live site uses. Safe to re-run: URLs already in the database
 * (…/uploads/m/…) and remote URLs are skipped; missing files are reported and left as they are.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { env, assertEnv } from '../config/env.js';
import { connectDb, disconnectDb } from '../config/db.js';
import { UPLOADS_DIR } from '../config/paths.js';
import { Product, Category, BlogPost, CatalogImport } from '../models/index.js';
import { saveImage, localPathFor, storageKind, describeStorage } from '../lib/storage.js';
import { logger } from '../lib/logger.js';

const cache = new Map(); // old url -> new url
let moved = 0;
let missing = 0;

async function migrateUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const file = localPathFor(url);
  if (!file) return url; // already in the database, or a remote picture
  if (cache.has(url)) return cache.get(url);
  let buffer;
  try {
    buffer = await fs.readFile(file);
  } catch {
    missing++;
    logger.warn(`Missing local file for ${url}`);
    cache.set(url, url);
    return url;
  }
  const rel = path.relative(UPLOADS_DIR, file).split(path.sep).join('/'); // e.g. products/123.jpg
  const folder = path.posix.dirname(rel) === '.' ? 'misc' : path.posix.dirname(rel);
  const next = await saveImage({ buffer, folder, filename: path.posix.basename(rel) });
  moved++;
  cache.set(url, next);
  logger.info(`${url} -> ${next}`);
  return next;
}

async function run() {
  assertEnv();
  if (storageKind !== 'mongo') {
    logger.error('UPLOAD_STORAGE is "disk"; set it to "mongo" (or unset it) to move pictures into the database.');
    process.exit(1);
  }
  await connectDb();
  logger.info(`Storage: ${describeStorage()} | database: ${mongoose.connection.name} | uploads base: ${env.uploadsBaseUrl}`);

  for (const p of await Product.find()) {
    const images = await Promise.all((p.images || []).map(migrateUrl));
    if (images.join('|') !== (p.images || []).join('|')) {
      p.images = images;
      await p.save();
    }
  }
  for (const c of await Category.find()) {
    const next = await migrateUrl(c.image);
    if (next !== c.image) {
      c.image = next;
      await c.save();
    }
  }
  for (const b of await BlogPost.find()) {
    const next = await migrateUrl(b.coverImage);
    if (next !== b.coverImage) {
      b.coverImage = next;
      await b.save();
    }
  }
  for (const imp of await CatalogImport.find()) {
    let changed = false;
    for (const it of imp.items) {
      const images = await Promise.all((it.images || []).map(migrateUrl));
      if (images.join('|') !== (it.images || []).join('|')) {
        it.images = images;
        changed = true;
      }
    }
    if (changed) await imp.save();
  }

  logger.info(`Done: ${moved} file${moved === 1 ? '' : 's'} moved into the database, ${missing} missing locally, ${cache.size} distinct URLs seen.`);
  await disconnectDb();
}

run().catch(async (err) => {
  logger.error('Migration failed', err);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
