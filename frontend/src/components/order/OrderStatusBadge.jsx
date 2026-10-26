import clsx from 'clsx';
import { ORDER_STATUS_META } from '@/constants/orderStatus';

export default function OrderStatusBadge({ status, className, size = 'sm' }) {
  const meta = ORDER_STATUS_META[status] || { label: status, classes: 'bg-surface-2 text-muted border-line', dot: 'bg-muted' };
  return (
    <span className={clsx('badge border', meta.classes, size === 'md' && 'px-3 py-1.5 text-sm', className)}>
      <span className={clsx('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}
