import { z } from 'zod';
import { rwandaPhone } from './orderRequestSchema';

/**
 * Minimal details for the "Order now" flow from the mini cart. The email is
 * where the order number is sent; the phone is what the shop calls to confirm
 * the delivery address.
 */
export const quickOrderSchema = z.object({
  email: z.string().trim().email('Enter a valid email so we can send your order number'),
  phone: rwandaPhone,
  name: z.string().trim().max(80).optional().or(z.literal('')),
});

export default quickOrderSchema;
