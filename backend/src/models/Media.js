import mongoose from 'mongoose';

/**
 * A picture stored in the database (product images, category images, blog covers, pictures
 * extracted from PDF catalogues). Images are capped at 5 MB on upload and catalogue pictures
 * are re-encoded to at most 1200 px, so a plain Buffer field is well inside MongoDB's 16 MB
 * document limit and GridFS is not needed. Served by GET /api/uploads/m/:id/:name.
 */
const mediaSchema = new mongoose.Schema(
  {
    folder: { type: String, required: true, index: true, maxlength: 120 },
    filename: { type: String, required: true, maxlength: 160 },
    contentType: { type: String, required: true, maxlength: 80 },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Media = mongoose.model('Media', mediaSchema);
export default Media;
