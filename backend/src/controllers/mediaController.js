import mongoose from 'mongoose';
import { Media } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';

/** GET /api/uploads/m/:id/:name — a picture stored in the database. Ids never change, so browsers may cache for a year. */
export const serve = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.notFound('Image not found');
  const media = await Media.findById(id).select('+data');
  if (!media) throw ApiError.notFound('Image not found');
  res.set({
    'Content-Type': media.contentType,
    'Content-Length': String(media.data.length),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  res.send(media.data);
});
