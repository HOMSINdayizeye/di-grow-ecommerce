import mongoose from 'mongoose';
import { uploadUrls } from './plugins/uploadUrls.js';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    icon: { type: String, trim: true, maxlength: 40, default: 'Tag' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.plugin(uploadUrls, {
  fix: (ret, fix) => {
    ret.image = fix(ret.image);
  },
});

export const Category = mongoose.model('Category', categorySchema);
export default Category;
