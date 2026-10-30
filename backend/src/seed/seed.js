/**
 * Seed the database.
 *
 *   npm run seed          categories, products, blog posts, settings and the admin user (only if empty)
 *   npm run seed:demo     ...plus demo orders so the dashboard and reports have data
 *   npm run seed:reset    wipe everything and seed again with demo data
 *
 * Catalog data is imported from the frontend mock (frontend/src/mocks/data.js) so the
 * mock and the real API stay the single source of truth for the demo content.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { env, assertEnv } from '../config/env.js';
import { connectDb, disconnectDb } from '../config/db.js';
import { REPO_DIR } from '../config/paths.js';
import { User, Category, Product, BlogPost, Settings, Order, Counter, Notification, AuditLog } from '../models/index.js';
import { normalisePhone, randomToken } from '../lib/utils.js';
import { logger } from '../lib/logger.js';

const args = new Set(process.argv.slice(2));
const RESET = args.has('--reset');
const DEMO = args.has('--demo');

async function loadMock() {
  const file = path.join(REPO_DIR, 'frontend', 'src', 'mocks', 'data.js');
  return import(pathToFileURL(file).href);
}

async function seedAdmin() {
  const existing = await User.findOne({ email: env.admin.email.toLowerCase() });
  if (existing) {
    logger.info(`Admin ${existing.email} already exists`);
    return existing;
  }
  const admin = new User({ name: env.admin.name, email: env.admin.email, role: 'admin', isActive: true });
  await admin.setPassword(env.admin.password);
  await admin.save();
  logger.info(`Created admin ${admin.email}`);
  return admin;
}

async function seedSettings(mock) {
  const s = await Settings.get();
  if (s.createdAt && s.updatedAt && s.updatedAt > s.createdAt) return s; // edited by hand already
  Object.assign(s, mock.siteSettings);
  await s.save();
  logger.info('Settings seeded');
  return s;
}

async function seedCatalog(mock) {
  if (await Category.countDocuments()) {
    logger.info('Catalog already present, skipping');
    return null;
  }
  const catIds = new Map();
  for (const c of mock.categories) {
    const doc = await Category.create({ name: c.name, slug: c.slug, description: c.description, icon: c.icon, image: c.image, isActive: c.isActive });
    catIds.set(c._id, doc._id);
  }
  const prodIds = new Map();
  for (const p of mock.products) {
    const doc = await Product.create({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      brand: p.brand,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      category: catIds.get(p.category._id),
      shortDescription: p.shortDescription,
      description: p.description,
      requiresPrescription: p.requiresPrescription,
      stockQty: p.stockQty,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isFeatured: p.isFeatured,
      tags: p.tags,
      createdAt: p.createdAt,
    });
    prodIds.set(p._id, doc._id);
  }
  logger.info(`Seeded ${catIds.size} categories and ${prodIds.size} products`);
  return prodIds;
}

async function seedPosts(mock) {
  if (await BlogPost.countDocuments()) return;
  for (const b of mock.blogPosts) {
    await BlogPost.create({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      coverImage: b.coverImage,
      category: b.category,
      tags: b.tags,
      author: b.author,
      readTime: b.readTime,
      content: b.content,
      isPublished: b.isPublished,
      publishedAt: b.publishedAt,
      createdAt: b.createdAt,
    });
  }
  logger.info(`Seeded ${mock.blogPosts.length} blog posts`);
}

async function seedOrders(mock, prodIds) {
  if (await Order.countDocuments()) {
    logger.info('Orders already present, skipping demo orders');
    return;
  }
  // Map mock product ids to the real ones; fall back to a slug lookup for safety.
  const bySlug = new Map((await Product.find().select('slug').lean()).map((p) => [p.slug, p._id]));
  for (const o of mock.orders) {
    const items = o.items.map((i) => ({ ...i, product: prodIds?.get(i.product) || bySlug.get(i.slug) }));
    const ymd = new Date(o.createdAt).toISOString().slice(0, 10).replace(/-/g, '');
    const seq = await Counter.next(`order:${ymd}`);
    await Order.create({
      orderNumber: `DG-${ymd}-${1000 + seq}`,
      trackingToken: randomToken(18),
      customer: { ...o.customer, phone: normalisePhone(o.customer.phone) },
      items,
      subtotal: o.subtotal,
      deliveryFee: o.deliveryFee,
      total: o.total,
      hasPrescriptionItems: o.hasPrescriptionItems,
      status: o.status,
      statusHistory: o.statusHistory,
      adminNotes: o.adminNotes,
      stockReserved: ['confirmed', 'delivered'].includes(o.status),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });
  }
  const newOrders = await Order.find({ status: 'new' });
  for (const o of newOrders) {
    await Notification.create({ type: 'new_order', title: 'New order request', message: `${o.orderNumber} from ${o.customer.name}`, orderId: o._id });
  }
  logger.info(`Seeded ${mock.orders.length} demo orders`);
}

async function main() {
  assertEnv();
  await connectDb();
  if (RESET) {
    await Promise.all([User, Category, Product, BlogPost, Settings, Order, Counter, Notification, AuditLog].map((M) => M.deleteMany({})));
    logger.warn('Database wiped (--reset)');
  }
  const mock = await loadMock();
  await seedAdmin();
  await seedSettings(mock);
  const prodIds = await seedCatalog(mock);
  await seedPosts(mock);
  if (DEMO) await seedOrders(mock, prodIds);
  logger.info('Seed complete');
  logger.info(`Sign in at ${env.frontendUrl}/admin/login with ${env.admin.email} / ${env.admin.password}`);
}

main()
  .catch((err) => {
    logger.error('Seed failed', err);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());
