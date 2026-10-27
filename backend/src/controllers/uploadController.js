import path from 'node:path';
import { env } from '../config/env.js';
import { UPLOADS_DIR } from '../config/paths.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';

/** multer has already stored the file; answer with the URL the frontend stores on the product. */
export const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Attach an image in the "image" field');
  const rel = path.relative(UPLOADS_DIR, req.file.path).split(path.sep).join('/');
  res.status(201).json({
    success: true,
    data: { url: `${env.uploadsBaseUrl}/${rel}`, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype },
  });
});
