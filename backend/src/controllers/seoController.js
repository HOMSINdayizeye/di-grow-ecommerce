import { env } from '../config/env.js';
import { Product, Category, BlogPost } from '../models/index.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const STATIC = ['', '/shop', '/how-it-works', '/about', '/contact', '/faq', '/blog', '/track-order', '/privacy-policy', '/terms'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** sitemap.xml built from live products, categories and posts; nginx maps /sitemap.xml here. */
export const sitemap = asyncHandler(async (_req, res) => {
  const base = (process.env.SITE_URL || env.frontendUrl).replace(/\/+$/, '');
  const [products, categories, posts] = await Promise.all([
    Product.find().select('slug updatedAt').lean(),
    Category.find({ isActive: true }).select('slug updatedAt').lean(),
    BlogPost.find({ isPublished: true }).select('slug updatedAt').lean(),
  ]);
  const url = (loc, lastmod, priority = '0.6') =>
    `<url><loc>${esc(base + loc)}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}<priority>${priority}</priority></url>`;
  const body = [
    ...STATIC.map((p) => url(p, null, p === '' ? '1.0' : '0.7')),
    ...categories.map((c) => url(`/category/${c.slug}`, c.updatedAt, '0.7')),
    ...products.map((p) => url(`/product/${p.slug}`, p.updatedAt, '0.8')),
    ...posts.map((p) => url(`/blog/${p.slug}`, p.updatedAt, '0.5')),
  ].join('');
  res.set('Content-Type', 'application/xml').set('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
});
