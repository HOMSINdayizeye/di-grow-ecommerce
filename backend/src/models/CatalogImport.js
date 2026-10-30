import mongoose from 'mongoose';
import { uploadUrls, fixList } from './plugins/uploadUrls.js';

export const IMPORT_ITEM_STATUSES = ['pending', 'imported', 'skipped'];

/**
 * One product candidate read from a catalogue PDF. The admin reviews it (adds a price,
 * picks a category, edits the text) and then turns it into a real Product.
 */
const itemSchema = new mongoose.Schema(
  {
    page: { type: Number, default: 1 },
    name: { type: String, trim: true, maxlength: 120, default: '' },
    sku: { type: String, trim: true, maxlength: 40, default: '' },
    brand: { type: String, trim: true, maxlength: 60, default: '' },
    price: { type: Number, default: null },
    compareAtPrice: { type: Number, default: null },
    stockQty: { type: Number, default: 0, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    shortDescription: { type: String, trim: true, maxlength: 160, default: '' },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    requiresPrescription: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    /** Every line of text the parser attached to this candidate, so the admin can see what was read. */
    sourceText: { type: String, default: '' },
    status: { type: String, enum: IMPORT_ITEM_STATUSES, default: 'pending' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  },
  { _id: true }
);

const catalogImportSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, trim: true, maxlength: 200 },
    fileSize: { type: Number, default: 0 },
    pages: { type: Number, default: 0 },
    warnings: { type: [String], default: [] },
    items: { type: [itemSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String, default: '' },
  },
  { timestamps: true }
);

catalogImportSchema.index({ createdAt: -1 });
catalogImportSchema.plugin(uploadUrls, {
  fix: (ret, fix) => {
    if (Array.isArray(ret.items)) ret.items.forEach((i) => (i.images = fixList(i.images, fix)));
  },
});

/** Counts the list page shows without loading every item field. */
catalogImportSchema.methods.summary = function summary() {
  const counts = { pending: 0, imported: 0, skipped: 0 };
  for (const it of this.items) counts[it.status] = (counts[it.status] || 0) + 1;
  return {
    _id: this._id,
    fileName: this.fileName,
    fileSize: this.fileSize,
    pages: this.pages,
    warnings: this.warnings,
    createdByName: this.createdByName,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    total: this.items.length,
    ...counts,
  };
};

export const CatalogImport = mongoose.model('CatalogImport', catalogImportSchema);
export default CatalogImport;
