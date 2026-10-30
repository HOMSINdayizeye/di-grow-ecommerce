import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { saveImage } from '../lib/storage.js';
import { safeFolder, makeFilename } from '../middleware/upload.js';

/** multer kept the file in memory; store it (disk or Cloudinary) and answer with the URL the frontend saves on the product. */
export const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Attach an image in the "image" field');
  const filename = makeFilename(req.file.originalname, req.file.mimetype);
  const url = await saveImage({ buffer: req.file.buffer, folder: safeFolder(req.body?.folder), filename });
  res.status(201).json({
    success: true,
    data: { url, filename, size: req.file.size, mimetype: req.file.mimetype },
  });
});
