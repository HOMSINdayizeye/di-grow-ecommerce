import { BlogPost, estimateReadTime, AuditLog } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { uniqueSlug, escapeRegex, pageParams, meta } from '../lib/utils.js';

/* ------------------------------ Public ------------------------------ */
export const listPublic = asyncHandler(async (req, res) => {
  const { q, category } = req.query;
  const filter = { isPublished: true };
  if (q) filter.title = new RegExp(escapeRegex(q), 'i');
  if (category) filter.category = category;
  const { page, limit, skip } = pageParams(req.query, 9, 50);
  const [items, total] = await Promise.all([
    BlogPost.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit),
    BlogPost.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: meta(page, limit, total) });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true });
  if (!post) throw ApiError.notFound('Post not found');
  // Prefer posts from the same category, then fill with the latest ones.
  const base = { isPublished: true, _id: { $ne: post._id } };
  const related = await BlogPost.find({ ...base, category: post.category }).sort({ publishedAt: -1 }).limit(3).select('-content');
  if (related.length < 3) {
    const more = await BlogPost.find({ ...base, _id: { $nin: [post._id, ...related.map((r) => r._id)] } })
      .sort({ publishedAt: -1 })
      .limit(3 - related.length)
      .select('-content');
    related.push(...more);
  }
  res.json({ success: true, data: { ...post.toObject(), related } });
});

/* ------------------------------ Admin ------------------------------ */
export const listAdmin = asyncHandler(async (req, res) => {
  const { q, status } = req.query;
  const filter = {};
  if (q) filter.title = new RegExp(escapeRegex(q), 'i');
  if (status === 'published') filter.isPublished = true;
  if (status === 'draft') filter.isPublished = false;
  const { page, limit, skip } = pageParams(req.query, 10, 100);
  const [items, total] = await Promise.all([
    BlogPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-content'),
    BlogPost.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: meta(page, limit, total) });
});

export const getAdmin = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  res.json({ success: true, data: post });
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body;
  const post = await BlogPost.create({
    ...body,
    slug: await uniqueSlug(BlogPost, body.title),
    readTime: estimateReadTime(body.content),
    author: { name: req.user.name, role: req.user.role === 'admin' ? 'Editor' : 'Staff writer' },
    publishedAt: body.isPublished ? new Date() : null,
  });
  AuditLog.record(req.user, 'blog.create', post.title, post.isPublished ? 'published' : 'draft');
  res.status(201).json({ success: true, data: post });
});

export const update = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  const body = req.body;
  if (body.title && body.title !== post.title) post.slug = await uniqueSlug(BlogPost, body.title, post._id);
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined) post[k] = v;
  });
  if (body.content !== undefined) post.readTime = estimateReadTime(body.content);
  if (body.isPublished !== undefined) post.publishedAt = body.isPublished ? post.publishedAt || new Date() : null;
  await post.save();
  AuditLog.record(req.user, 'blog.update', post.title, post.isPublished ? 'published' : 'draft');
  res.json({ success: true, data: post });
});

export const remove = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  await post.deleteOne();
  AuditLog.record(req.user, 'blog.delete', post.title);
  res.json({ success: true, data: { _id: post._id } });
});
