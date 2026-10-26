import { z } from 'zod';
import { rwandaPhone } from './orderRequestSchema';

export const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^DG-\d{8}-\d{4,}$/, 'Order numbers look like DG-20260101-1001'),
  phone: rwandaPhone,
});

export default trackOrderSchema;
