import mongoose from 'mongoose';

export const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, trim: true, maxlength: 40, unique: true },
    brand: { type: String, trim: true, maxlength: 60, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    images: { type: [String], default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    shortDescription: { type: String, trim: true, maxlength: 160, default: '' },
    description: { type: String, default: '' },
    requiresPrescription: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    stockQty: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    lowStockNotifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });

productSchema.pre('validate', function syncStock(next) {
  this.inStock = (this.stockQty || 0) > 0;
  if (!this.images?.length) this.images = [PLACEHOLDER_IMAGE];
  next();
});

/** Fields populated from the category so responses match category{_id,name,slug}. */
export const CATEGORY_FIELDS = 'name slug';

export const Product = mongoose.model('Product', productSchema);
export default Product;
