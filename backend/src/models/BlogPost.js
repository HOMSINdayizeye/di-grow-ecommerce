import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, trim: true, maxlength: 300, default: '' },
    coverImage: { type: String, default: '' },
    category: { type: String, trim: true, default: 'General' },
    tags: { type: [String], default: [] },
    author: {
      name: { type: String, default: 'Di-Grow Team' },
      role: { type: String, default: 'Editor' },
    },
    readTime: { type: Number, default: 1 },
    content: { type: String, default: '' },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

blogPostSchema.index({ publishedAt: -1 });

export const estimateReadTime = (html) =>
  Math.max(1, Math.round(String(html || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
