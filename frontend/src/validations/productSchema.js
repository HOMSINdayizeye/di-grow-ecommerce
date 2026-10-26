import { z } from 'zod';

const money = z.coerce.number({ invalid_type_error: 'Enter a number' }).min(0, 'Must be 0 or more');

export const productSchema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(120),
    sku: z.string().trim().min(2, 'SKU is required').max(40),
    brand: z.string().trim().max(60).optional().or(z.literal('')),
    categoryId: z.string().min(1, 'Choose a category'),
    price: money.positive('Price must be greater than 0'),
    compareAtPrice: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), money.nullable()),
    stockQty: z.coerce.number().int('Whole numbers only').min(0, 'Stock cannot be negative'),
    shortDescription: z.string().trim().min(10, 'Add a short description (10+ characters)').max(160),
    description: z.string().trim().min(20, 'Describe the product (20+ characters)'),
    requiresPrescription: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    images: z.array(z.string()).max(6, 'Up to 6 images').default([]),
    tags: z.string().optional().or(z.literal('')),
  })
  .refine((v) => v.compareAtPrice == null || v.compareAtPrice > v.price, {
    path: ['compareAtPrice'],
    message: 'Compare-at price should be higher than the price',
  });

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(60),
  description: z.string().trim().max(200).optional().or(z.literal('')),
  icon: z.string().trim().max(40).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
  excerpt: z.string().trim().min(20, 'Excerpt must be at least 20 characters').max(300),
  category: z.string().trim().min(2, 'Category is required'),
  coverImage: z.string().trim().optional().or(z.literal('')),
  content: z.string().trim().min(50, 'Write at least 50 characters'),
  isPublished: z.boolean().default(false),
});

export default productSchema;
