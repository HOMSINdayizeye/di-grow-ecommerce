import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ShoppingCart, Phone } from 'lucide-react';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import PrescriptionBadge from '@/components/product/PrescriptionBadge';
import EmptyState from '@/components/common/EmptyState';
import { TableSkeleton } from '@/components/common/Loader';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime, timeAgo } from '@/utils/formatDate';

const itemCount = (order) => (order.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0);

/**
 * Responsive orders list: table on md+, stacked cards on mobile.
 *   <OrdersTable orders={orders} loading={loading} highlightId={id} />
 */
export default function OrdersTable({ orders = [], loading = false, onRowClick, highlightId, emptyTitle = 'No orders found', emptyDescription }) {
  const navigate = useNavigate();
  const open = (order) => (onRowClick ? onRowClick(order) : navigate(`/admin/orders/${order._id}`));

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="card">
        <EmptyState icon={ShoppingCart} title={emptyTitle} description={emptyDescription || 'Orders will appear here as soon as customers send requests.'} compact />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto scrollbar-thin md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-2/60 font-ui text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Order #</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold text-right">Items</th>
              <th className="px-4 py-3 font-semibold text-right">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Rx</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/10">
            {orders.map((o) => (
              <tr
                key={o._id}
                onClick={() => open(o)}
                className={clsx('cursor-pointer transition hover:bg-surface-2/60', highlightId === o._id && 'bg-accent-500/10 animate-fade-in')}
              >
                <td className="px-4 py-3">
                  <Link to={`/admin/orders/${o._id}`} onClick={(e) => e.stopPropagation()} className="font-mono text-xs font-semibold text-brand-500 hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{o.customer?.name}</p>
                  <p className="text-xs text-muted">{o.customer?.phone}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">{itemCount(o)}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3">{o.hasPrescriptionItems ? <PrescriptionBadge /> : <span className="text-xs text-muted">—</span>}</td>
                <td className="px-4 py-3 text-muted" title={formatDateTime(o.createdAt)}>
                  {timeAgo(o.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-line/10 md:hidden">
        {orders.map((o) => (
          <li key={o._id}>
            <button
              type="button"
              onClick={() => open(o)}
              className={clsx('w-full p-4 text-left transition hover:bg-surface-2/60', highlightId === o._id && 'bg-accent-500/10')}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-semibold text-brand-500">{o.orderNumber}</span>
                <OrderStatusBadge status={o.status} />
              </div>
              <p className="mt-2 font-medium text-ink">{o.customer?.name}</p>
              <p className="inline-flex items-center gap-1 text-xs text-muted">
                <Phone className="h-3 w-3" /> {o.customer?.phone}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>
                  {itemCount(o)} item{itemCount(o) === 1 ? '' : 's'} · <span className="font-semibold text-ink">{formatCurrency(o.total)}</span>
                </span>
                <span className="flex items-center gap-2">
                  {o.hasPrescriptionItems && <PrescriptionBadge />}
                  <span title={formatDateTime(o.createdAt)}>{timeAgo(o.createdAt)}</span>
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
