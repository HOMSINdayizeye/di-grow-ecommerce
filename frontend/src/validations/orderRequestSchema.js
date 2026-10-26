import { z } from 'zod';
import { DISTRICT_NAMES } from '@/constants/districts';

/** Rwandan mobile numbers: 07X XXX XXXX, optionally with +250 / 250 prefix. */
export const rwandaPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => /^(\+?250)?0?7[2389]\d{7}$/.test(v), 'Enter a valid Rwandan mobile number (e.g. 078 123 4567)');

export const normalisePhone = (v) => {
  const digits = String(v).replace(/\D/g, '');
  const last9 = digits.slice(-9);
  return `+250${last9}`;
};

export const orderRequestSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  phone: rwandaPhone,
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  district: z.enum(DISTRICT_NAMES, { errorMap: () => ({ message: 'Choose your district' }) }),
  sector: z.string().trim().min(1, 'Choose your sector'),
  address: z.string().trim().min(5, 'Add a street or landmark so our rider can find you').max(200),
  notes: z.string().trim().max(500, 'Keep notes under 500 characters').optional().or(z.literal('')),
  prescriptionAck: z.boolean().optional(),
  agree: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue' }) }),
});

export default orderRequestSchema;
