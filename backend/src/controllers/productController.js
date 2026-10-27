import mongoose from 'mongoose';
import { Product, Category, CATEGORY_FIELDS, AuditLog } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { uniqueSlug, escapeRegex, pageParams, meta, isTrue } from '../lib/utils.js';

const LOW_STOCK = 5;

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  popular: { reviewCount: -1 },
  rating: { rating: -1 },
  name: { name: 1 },
};

/** Build a case-insensitive search across the fields the shop search box covers. */
async function searchFilter(q) {
  const rx = new RegExp(escapeRegex(q), 'i');
  const catIds = await Category.find({ name: rx }).distinct('_id');
  return { $or: [{ name: rx }, { shortDescription: rx }, { brand: rx }, { tags: rx }, { sku: rx }, { category: { $in: catIds } }] };
}

const populate = (query) => query.populate('category', CATEGORY_FIELDS);

/* ------------------------------ Public ------------------------------ */
export const listPublic = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, inStock, prescription, featured, sort = 'newest' } = req.query;
  const filter = {};
  const and = [];
  if (q) and.push(await searchFilter(q));
  if (category) {
    const slugs = String(category).split(',').map((s) => s.trim()).filter(Boolean);
    const ids = await Category.find({ slug: { $in: slugs } }).distinct('_id');
    filter.category = { $in: ids };
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (isTrue(inStock)) filter.inStock = true;
  if (prescription === 'true') filter.requiresPrescription = true;
  if (prescription === 'false') filter.requiresPrescription = false;
  if (isTrue(featured)) filter.isFeatured = true;
  if (and.length) filter.$and = and;

  const { page, limit, skip } = pageParams(req.query, 12, 60);
  const [items, total] = await Promise.all([
    populate(Product.find(filter).sort(SORTS[sort] || SORTS.newest).skip(skip).limit(limit)),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: meta(page, limit, total) });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const q = mongoose.isValidObjectId(slug) ? { $or: [{ slug }, { _id: slug }] } : { slug };
  const product = await populate(Product.findOne(q));
  if (!product) throw ApiError.notFound('Product not found');
  const related = await populate(
    Product.find({ category: product.category._id, _id: { $ne: product._id } }).sort({ isFeatured: -1, reviewCount: -1 }).limit(4)
  );
  res.json({ success: true, data: { ...product.toObject(), related } });
});

/* ------------------------------ Admin ------------------------------ */
export const listAdmin = asyncHandler(async (req, res) => {
  const { q, category, stock, sort = 'newest' } = req.query;
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { sku: rx }];
  }
  if (category) {
    const cat = await Category.findOne({ slug: category });
    filter.category = cat ? cat._id : null;
  }
  if (stock === 'low') filter.stockQty = { $lte: LOW_STOCK };
  if (stock === 'out') filter.inStock = false;

  const { page, limit, skip } = pageParams(req.query, 10, 100);
  const [items, total] = await Promise.all([
    populate(Product.find(filter).sort(SORTS[sort] || SORTS.newest).skip(skip).limit(limit)),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: meta(page, limit, total) });
});

export const getAdmin = asyncHandler(async (req, res) => {
  const product = await populate(Product.findById(req.params.id));
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: product });
});

export const create = asyncHandler(async (req, res) => {
  const { categoryId, ...body } = req.body;
  const category = await Category.findById(categoryId);
  if (!category) throw ApiError.badRequest('Choose a valid category');
  if (await Product.exists({ sku: body.sku })) throw ApiError.badRequest('That SKU is already used by another product');
  const product = await Product.create({ ...body, category: category._id, slug: await uniqueSlug(Product, body.name) });
  await product.populate('category', CATEGORY_FIELDS);
  AuditLog.record(req.user, 'product.create', product.name, `SKU ${product.sku}`);
  res.status(201).json({ success: true, data: product });
});

export const update = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  const { categoryId, ...body } = req.body;
  const changes = [];

  if (categoryId && String(categoryId) !== String(product.category)) {
    const category = await Category.findById(categoryId);
    if (!category) throw ApiError.badRequest('Choose a valid category');
    product.category = category._id;
    changes.push('category');
  }
  if (body.sku && body.sku !== product.sku && (await Product.exists({ sku: body.sku, _id: { $ne: product._id } }))) {
    throw ApiError.badRequest('That SKU is already used by another product');
  }
  if (body.name && body.name !== product.name) product.slug = await uniqueSlug(Product, body.name, product._id);
  ['price', 'stockQty', 'compareAtPrice'].forEach((k) => {
    if (body[k] !== undefined && body[k] !== product[k]) changes.push(`${k} ${product[k]} -> ${body[k]}`);
  });
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined) product[k] = v;
  });
  if (product.stockQty > LOW_STOCK) product.lowStockNotifiedAt = null;
  await product.save();
  await product.populate('category', CATEGORY_FIELDS);
  AuditLog.record(req.user, 'product.update', product.name, changes.join(', '));
  res.json({ success: true, data: product });
});

export const remove = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  await product.deleteOne();
  AuditLog.record(req.user, 'product.delete', product.name, `SKU ${product.sku}`);
  res.json({ success: true, data: { _id: product._id } });
});
