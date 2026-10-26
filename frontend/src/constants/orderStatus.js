export const ORDER_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.NEW,
  ORDER_STATUS.CONTACTED,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.DELIVERED,
];

export const ORDER_STATUS_META = {
  [ORDER_STATUS.NEW]: {
    label: 'New',
    description: 'We have received your request and will call you shortly.',
    color: 'sky',
    classes: 'bg-sky-500/15 text-sky-600 border-sky-500/30',
    dot: 'bg-sky-500',
  },
  [ORDER_STATUS.CONTACTED]: {
    label: 'Contacted',
    description: 'Our team has reached out to confirm the details.',
    color: 'gold',
    classes: 'bg-gold-500/15 text-gold-500 border-gold-500/30',
    dot: 'bg-gold-500',
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    description: 'Your order is confirmed and being prepared for delivery.',
    color: 'accent',
    classes: 'bg-accent-500/15 text-accent-500 border-accent-500/30',
    dot: 'bg-accent-500',
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Delivered',
    description: 'Your order has been delivered. Thank you!',
    color: 'success',
    classes: 'bg-success/15 text-success border-success/30',
    dot: 'bg-success',
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'Cancelled',
    description: 'This order was cancelled.',
    color: 'danger',
    classes: 'bg-danger/15 text-danger border-danger/30',
    dot: 'bg-danger',
  },
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export default ORDER_STATUS;
