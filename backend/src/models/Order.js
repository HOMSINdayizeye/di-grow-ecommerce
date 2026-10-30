import mongoose from 'mongoose';
import { uploadUrls } from './plugins/uploadUrls.js';

export const ORDER_STATUSES = ['new', 'contacted', 'confirmed', 'delivered', 'cancelled'];

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    slug: String,
    price: Number,
    quantity: { type: Number, min: 1 },
    image: String,
    requiresPrescription: { type: Boolean, default: false },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES },
    note: { type: String, default: '' },
    at: { type: Date, default: Date.now },
    by: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    trackingToken: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, index: true },
      email: { type: String, default: '', trim: true, lowercase: true },
      district: { type: String, default: '' },
      sector: { type: String, default: '' },
      address: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    items: { type: [itemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    hasPrescriptionItems: { type: Boolean, default: false },
    status: { type: String, enum: ORDER_STATUSES, default: 'new', index: true },
    statusHistory: { type: [historySchema], default: [] },
    adminNotes: { type: String, default: '' },
    stockReserved: { type: Boolean, default: false },
    staleNotifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

/** Hide internal bookkeeping from API responses. */
orderSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.stockReserved;
    delete ret.staleNotifiedAt;
    delete ret.__v;
    return ret;
  },
});
orderSchema.plugin(uploadUrls, {
  fix: (ret, fix) => {
    if (Array.isArray(ret.items)) ret.items.forEach((i) => (i.image = fix(i.image)));
  },
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
