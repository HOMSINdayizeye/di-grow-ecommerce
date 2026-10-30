import { z } from 'zod';
import { rwandaPhone } from './orderRequestSchema';

/**
 * Order numbers look like DG-20260101-1001. Older orders may have fewer digits after the last
 * dash (DG-20260101-1), so any count of digits is accepted; spaces and case do not matter.
 */
export const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .transform((v) => v.replace(/\s+/g, '').toUpperCase())
    .refine((v) => /^DG-\d{8}-\d{1,8}$/.test(v), 'Order numbers look like DG-20260101-1001'),
  phone: rwandaPhone,
});

export default trackOrderSchema;
