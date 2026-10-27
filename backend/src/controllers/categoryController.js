import mongoose from 'mongoose';
import { Category, Product, AuditLog } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { uniqueSlug } from '../lib/utils.js';

/** Attach productCount to each category with one aggregation. */
async function withCounts(categories) {
  const counts = await Product.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  return categories.map((c) => ({ ...c.toObject(), productCount: map.get(String(c._id)) || 0 }));
}

export const listPublic = asyncHandler(async (_req, res) => {
  const cats = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: await withCounts(cats) });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const q = mongoose.isValidObjectId(slug) ? { $or: [{ slug }, { _id: slug }] } : { slug };
  const cat = await Category.findOne(q);
  if (!cat) throw ApiError.notFound('Category not found');
  const [withCount] = await withCounts([cat]);
  res.json({ success: true, data: withCount });
});

export const listAdmin = asyncHandler(async (_req, res) => {
  const cats = await Category.find().sort({ name: 1 });
  res.json({ success: true, data: await withCounts(cats) });
});

export const create = asyncHandler(async (req, res) => {
  const { name, description, icon, image, isActive } = req.body;
  const cat = await Category.create({
    name,
    description,
    icon: icon || 'Tag',
    image,
    isActive,
    slug: await uniqueSlug(Category, name),
  });
  AuditLog.record(req.user, 'category.create', cat.name);
  res.status(201).json({ success: true, data: { ...cat.toObject(), productCount: 0 } });
});

export const update = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) throw ApiError.notFound('Category not found');
  const before = cat.name;
  Object.entries(req.body).forEach(([k, v]) => {
    if (v !== undefined) cat[k] = v;
  });
  if (req.body.icon === '') cat.icon = 'Tag';
  await cat.save();
  AuditLog.record(req.user, 'category.update', cat.name, before !== cat.name ? `renamed from ${before}` : '');
  const [withCount] = await withCounts([cat]);
  res.json({ success: true, data: withCount });
});

export const remove = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) throw ApiError.notFound('Category not found');
  if (await Product.exists({ category: cat._id })) throw ApiError.badRequest('Move or delete its products first');
  await cat.deleteOne();
  AuditLog.record(req.user, 'category.delete', cat.name);
  res.json({ success: true, data: { _id: cat._id } });
});
