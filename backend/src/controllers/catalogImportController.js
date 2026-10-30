import { CatalogImport, Product, Category, AuditLog } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { uniqueSlug, slugify } from '../lib/utils.js';
import { parseCatalogPdf } from '../lib/catalogParser.js';
import { saveImage, deleteFolder } from '../lib/storage.js';
import { logger } from '../lib/logger.js';

const importFolder = (id) => `catalog/${id}`;

/** Upload a PDF, read it and store the candidates for review. */
export const create = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Attach a PDF file in the "catalog" field');
  const doc = new CatalogImport({
    fileName: req.file.originalname || 'catalogue.pdf',
    fileSize: req.file.size,
    createdBy: req.user._id,
    createdByName: req.user.name,
  });
  const folder = importFolder(doc._id);
  const started = Date.now();
  let parsed;
  try {
    parsed = await parseCatalogPdf(req.file.buffer, {
      saveImage: ({ buffer, filename }) => saveImage({ buffer, folder, filename }),
    });
  } catch (err) {
    await deleteFolder(folder);
    logger.warn('Catalogue PDF could not be parsed', err.message);
    throw ApiError.badRequest(`Could not read that PDF (${err.message}). Make sure it is a real PDF and not password protected.`);
  }
  if (!parsed.items.length) {
    await deleteFolder(folder);
    throw ApiError.badRequest('No products were found in that PDF. Scanned catalogues without selectable text or embedded pictures cannot be read.');
  }
  doc.pages = parsed.pages;
  doc.warnings = parsed.warnings;
  doc.items = parsed.items;
  await doc.save();
  logger.info(`Catalogue ${doc.fileName}: ${doc.items.length} candidates from ${doc.pages} pages in ${Date.now() - started} ms`);
  AuditLog.record(req.user, 'catalog.import', doc.fileName, `${doc.items.length} candidates from ${doc.pages} pages`);
  res.status(201).json({ success: true, data: doc });
});

export const list = asyncHandler(async (_req, res) => {
  const docs = await CatalogImport.find().sort({ createdAt: -1 }).limit(50).select('fileName fileSize pages warnings createdByName createdAt updatedAt items.status');
  res.json({ success: true, data: docs.map((d) => d.summary()) });
});

export const get = asyncHandler(async (req, res) => {
  const doc = await CatalogImport.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Import not found');
  res.json({ success: true, data: doc });
});

const EDITABLE = ['name', 'sku', 'brand', 'price', 'compareAtPrice', 'stockQty', 'shortDescription', 'description', 'images', 'requiresPrescription', 'tags', 'status'];

/** Save the admin's edits (prices, names, categories...) on the candidates. */
export const updateItems = asyncHandler(async (req, res) => {
  const doc = await CatalogImport.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Import not found');
  let changed = 0;
  for (const patch of req.body.items) {
    const item = doc.items.id(patch._id);
    if (!item || item.status === 'imported') continue;
    for (const key of EDITABLE) {
      if (patch[key] !== undefined) item[key] = patch[key];
    }
    if (patch.categoryId !== undefined) item.category = patch.categoryId ? patch.categoryId : null;
    changed++;
  }
  await doc.save();
  res.json({ success: true, data: doc, meta: { changed } });
});

/** Create real products from the selected candidates. Reports per-item failures instead of aborting. */
export const commit = asyncHandler(async (req, res) => {
  const doc = await CatalogImport.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Import not found');
  const { itemIds, defaults } = req.body;

  const categoryIds = new Set();
  for (const id of itemIds) {
    const item = doc.items.id(id);
    const cat = item?.category || defaults.categoryId;
    if (cat) categoryIds.add(String(cat));
  }
  const categories = new Map((await Category.find({ _id: { $in: [...categoryIds] } })).map((c) => [String(c._id), c]));

  const created = [];
  const failed = [];
  const year = new Date().getFullYear().toString().slice(-2);
  for (const id of itemIds) {
    const item = doc.items.id(id);
    if (!item) {
      failed.push({ _id: id, message: 'Candidate not found' });
      continue;
    }
    if (item.status === 'imported') {
      failed.push({ _id: id, message: 'Already imported' });
      continue;
    }
    const name = (item.name || '').trim();
    const category = categories.get(String(item.category || defaults.categoryId || ''));
    const price = Number(item.price);
    if (name.length < 3) {
      failed.push({ _id: id, message: 'Give it a name (3+ characters)' });
      continue;
    }
    if (!category) {
      failed.push({ _id: id, message: 'Choose a category' });
      continue;
    }
    if (!(price > 0)) {
      failed.push({ _id: id, message: 'Enter a price greater than 0' });
      continue;
    }
    if (item.compareAtPrice != null && item.compareAtPrice !== '' && !(Number(item.compareAtPrice) > price)) {
      failed.push({ _id: id, message: 'Compare-at price should be higher than the price' });
      continue;
    }

    // Fill what the catalogue did not give, so the storefront never shows empty cards.
    const description = (item.description || '').trim() || (item.shortDescription || '').trim() || `${name}. Imported from ${doc.fileName}.`;
    const shortDescription = (item.shortDescription || '').trim() || description.replace(/\s+/g, ' ').slice(0, 160);

    let sku = (item.sku || '').trim().toUpperCase();
    if (!sku) sku = `DG-${year}-${slugify(name).replace(/-/g, '').slice(0, 10).toUpperCase() || 'ITEM'}`;
    let candidate = sku;
    let n = 2;
    // eslint-disable-next-line no-await-in-loop
    while (await Product.exists({ sku: candidate })) candidate = `${sku}-${n++}`;
    sku = candidate;

    try {
      const product = await Product.create({
        name,
        slug: await uniqueSlug(Product, name),
        sku,
        brand: item.brand || '',
        price,
        compareAtPrice: item.compareAtPrice != null && item.compareAtPrice !== '' ? Number(item.compareAtPrice) : null,
        images: item.images || [],
        category: category._id,
        shortDescription,
        description,
        requiresPrescription: !!item.requiresPrescription,
        // Drafts start at 0 stock, so 0 means "not filled in" and the default applies.
        stockQty: item.stockQty > 0 ? item.stockQty : defaults.stockQty ?? 0,
        tags: item.tags || [],
      });
      item.status = 'imported';
      item.product = product._id;
      item.sku = sku;
      item.category = category._id;
      created.push({ _id: id, productId: product._id, name: product.name });
    } catch (err) {
      failed.push({ _id: id, message: err.message });
    }
  }
  await doc.save();
  if (created.length) AuditLog.record(req.user, 'catalog.commit', doc.fileName, `${created.length} product${created.length === 1 ? '' : 's'} created`);
  res.json({ success: true, data: { created, failed, import: doc } });
});

export const remove = asyncHandler(async (req, res) => {
  const doc = await CatalogImport.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Import not found');
  const keepImages = doc.items.some((i) => i.status === 'imported');
  await doc.deleteOne();
  // Imported products still point at these pictures, so only clean up when nothing was imported.
  if (!keepImages) await deleteFolder(importFolder(doc._id));
  AuditLog.record(req.user, 'catalog.delete', doc.fileName);
  res.json({ success: true, data: { _id: doc._id } });
});
