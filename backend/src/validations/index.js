/**
 * Zod schemas mirroring frontend/src/validations so the API rejects exactly
 * what the forms reject, even for clients that bypass the UI.
 */
import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';
import { ROLES } from '../models/User.js';

const optionalStr = (max = 500) => z.string().trim().max(max).optional().or(z.literal('')).default('');
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const money = z.coerce.number({ invalid_type_error: 'Enter a number' }).min(0, 'Must be 0 or more');
const bool = z.boolean();

/** Rwandan mobile numbers: 07X XXX XXXX, optionally with +250 / 250 prefix. */
export const rwandaPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => /^(\+?250)?0?7[2389]\d{7}$/.test(v), 'Enter a valid Rwandan mobile number (e.g. 078 123 4567)');

/* ------------------------------ Auth ------------------------------ */
export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
  remember: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({ email: z.string().trim().email('Enter a valid email') });

export const verifyResetCodeSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  code: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, ''))
    .refine((v) => /^\d{5}$/.test(v), 'Enter the 5-digit code from the email'),
});

export const resetPasswordSchema = verifyResetCodeSchema.extend({
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z.string().min(8, 'Use at least 8 characters').max(128),
});

/* ------------------------------ Staff ------------------------------ */
export const createStaffSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  email: z.string().trim().email('Enter a valid email'),
  role: z.enum(ROLES).default('staff'),
  password: z.string().min(8, 'Use at least 8 characters').max(128),
  isActive: bool.default(true),
});

export const updateStaffSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email('Enter a valid email').optional(),
  role: z.enum(ROLES).optional(),
  password: z.string().min(8, 'Use at least 8 characters').max(128).optional().or(z.literal('')),
  isActive: bool.optional(),
});

/* ---------------------------- Catalog ----------------------------- */
export const productSchema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(120),
    sku: z.string().trim().min(2, 'SKU is required').max(40),
    brand: optionalStr(60),
    categoryId: objectId.describe('Choose a category'),
    price: money.positive('Price must be greater than 0'),
    compareAtPrice: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), money.nullable()).default(null),
    stockQty: z.coerce.number().int('Whole numbers only').min(0, 'Stock cannot be negative').default(0),
    shortDescription: z.string().trim().min(10, 'Add a short description (10+ characters)').max(160),
    description: z.string().trim().min(20, 'Describe the product (20+ characters)'),
    requiresPrescription: bool.default(false),
    isFeatured: bool.default(false),
    images: z.array(z.string().trim().min(1)).max(6, 'Up to 6 images').default([]),
    tags: z
      .union([z.array(z.string()), z.string()])
      .transform((v) =>
        (Array.isArray(v) ? v : String(v).split(','))
          .map((t) => String(t).trim().toLowerCase())
          .filter(Boolean)
      )
      .default([]),
  })
  .refine((v) => v.compareAtPrice == null || v.compareAtPrice > v.price, {
    path: ['compareAtPrice'],
    message: 'Compare-at price should be higher than the price',
  });

export const productUpdateSchema = productSchema.innerType().partial().refine((v) => v.compareAtPrice == null || v.price == null || v.compareAtPrice > v.price, {
  path: ['compareAtPrice'],
  message: 'Compare-at price should be higher than the price',
});

const nullableMoney = z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), money.nullable());

/** Edits an admin makes on catalogue-import candidates before turning them into products. */
export const catalogItemsUpdateSchema = z.object({
  items: z
    .array(
      z.object({
        _id: objectId,
        name: z.string().trim().max(120).optional(),
        sku: z.string().trim().max(40).optional(),
        brand: z.string().trim().max(60).optional(),
        categoryId: z.union([objectId, z.literal(''), z.null()]).optional(),
        price: nullableMoney.optional(),
        compareAtPrice: nullableMoney.optional(),
        stockQty: z.coerce.number().int('Whole numbers only').min(0).optional(),
        shortDescription: z.string().trim().max(160).optional(),
        description: z.string().trim().max(20000).optional(),
        requiresPrescription: bool.optional(),
        images: z.array(z.string().trim().min(1)).max(6).optional(),
        tags: z
          .union([z.array(z.string()), z.string()])
          .transform((v) => (Array.isArray(v) ? v : String(v).split(',')).map((t) => String(t).trim().toLowerCase()).filter(Boolean))
          .optional(),
        status: z.enum(['pending', 'skipped']).optional(),
      })
    )
    .min(1)
    .max(500),
});

export const catalogCommitSchema = z.object({
  itemIds: z.array(objectId).min(1, 'Select at least one product').max(500),
  defaults: z
    .object({
      categoryId: z.union([objectId, z.literal('')]).optional(),
      stockQty: z.coerce.number().int().min(0).optional(),
    })
    .optional()
    .default({}),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(60),
  description: optionalStr(200),
  icon: optionalStr(40),
  image: optionalStr(500),
  isActive: bool.default(true),
});
export const categoryUpdateSchema = categorySchema.partial();

export const blogPostSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
  excerpt: z.string().trim().min(20, 'Excerpt must be at least 20 characters').max(300),
  category: z.string().trim().min(2, 'Category is required').max(60),
  coverImage: optionalStr(500),
  content: z.string().trim().min(50, 'Write at least 50 characters'),
  tags: z
    .union([z.array(z.string()), z.string()])
    .transform((v) => (Array.isArray(v) ? v : String(v).split(',')).map((t) => String(t).trim().toLowerCase()).filter(Boolean))
    .optional(),
  isPublished: bool.default(false),
});
export const blogPostUpdateSchema = blogPostSchema.partial();

/* ----------------------------- Orders ----------------------------- */
export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, 'Enter your full name').max(80),
    phone: rwandaPhone,
    email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')).default(''),
    // Location is optional: the quick "order now" flow agrees the delivery place on WhatsApp afterwards.
    district: optionalStr(40),
    sector: optionalStr(60),
    address: optionalStr(200),
    notes: optionalStr(500),
  }),
  items: z
    .array(
      z.object({
        productId: objectId,
        quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(99),
      })
    )
    .min(1, 'Your cart is empty')
    .max(50),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().trim().min(5, 'Enter your order number').max(30),
  phone: rwandaPhone,
});

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, { errorMap: () => ({ message: 'Invalid status' }) }),
  note: optionalStr(500),
});

export const orderNotesSchema = z.object({ adminNotes: z.string().max(2000).default('') });

/* ---------------------------- Settings ---------------------------- */
export const settingsSchema = z
  .object({
    storeName: z.string().trim().min(2).max(60),
    tagline: optionalStr(120),
    phone: z.string().trim().min(7, 'Phone is required').max(30),
    whatsapp: z.string().trim().regex(/^\d{9,15}$/, 'Digits only, with country code (e.g. 250788000000)'),
    email: z.string().trim().email('Enter a valid email'),
    address: optionalStr(160),
    openingHours: optionalStr(80),
    deliveryFee: z.coerce.number().min(0),
    freeDeliveryThreshold: z.coerce.number().min(0),
    deliveryNote: optionalStr(200),
    announcement: optionalStr(160),
    announcementEnabled: bool.default(false),
    notifyEmail: bool.default(true),
    notifySms: bool.default(true),
    notifyEmailRecipients: optionalStr(300),
    notifySmsRecipients: optionalStr(300),
    socialFacebook: optionalStr(200),
    socialInstagram: optionalStr(200),
    socialTwitter: optionalStr(200),
    seoTitle: optionalStr(70),
    seoDescription: optionalStr(160),
  })
  .partial();
