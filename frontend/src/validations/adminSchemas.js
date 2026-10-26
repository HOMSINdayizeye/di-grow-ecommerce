import { z } from 'zod';
import { ROLES } from '@/constants/roles';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const staffSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  email: z.string().trim().email('Enter a valid email'),
  role: z.enum([ROLES.ADMIN, ROLES.STAFF]),
  password: z.string().min(8, 'Use at least 8 characters').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(120).optional().or(z.literal('')),
  phone: z.string().trim().min(7, 'Phone is required'),
  whatsapp: z.string().trim().regex(/^\d{9,15}$/, 'Digits only, with country code (e.g. 250788000000)'),
  email: z.string().trim().email('Enter a valid email'),
  address: z.string().trim().max(160).optional().or(z.literal('')),
  openingHours: z.string().trim().max(80).optional().or(z.literal('')),
  deliveryFee: z.coerce.number().min(0),
  freeDeliveryThreshold: z.coerce.number().min(0),
  deliveryNote: z.string().trim().max(200).optional().or(z.literal('')),
  announcement: z.string().trim().max(160).optional().or(z.literal('')),
  announcementEnabled: z.boolean().default(false),
  notifyEmail: z.boolean().default(true),
  notifySms: z.boolean().default(true),
  notifyEmailRecipients: z.string().trim().optional().or(z.literal('')),
  notifySmsRecipients: z.string().trim().optional().or(z.literal('')),
  socialFacebook: z.string().trim().optional().or(z.literal('')),
  socialInstagram: z.string().trim().optional().or(z.literal('')),
  socialTwitter: z.string().trim().optional().or(z.literal('')),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(160).optional().or(z.literal('')),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  subject: z.string().trim().min(3, 'Add a subject'),
  message: z.string().trim().min(10, 'Tell us a little more (10+ characters)').max(1000),
});
