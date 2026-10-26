import clsx from 'clsx';
import { Check, PhoneCall, PackageCheck, Truck, Inbox, XCircle } from 'lucide-react';
import { ORDER_STATUS, ORDER_STATUS_FLOW, ORDER_STATUS_META } from '@/constants/orderStatus';
import { formatDateTime } from '@/utils/formatDate';

const ICONS = {
  [ORDER_STATUS.NEW]: Inbox,
  [ORDER_STATUS.CONTACTED]: PhoneCall,
  [ORDER_STATUS.CONFIRMED]: PackageCheck,
  [ORDER_STATUS.DELIVERED]: Truck,
  [ORDER_STATUS.CANCELLED]: XCircle,
};

/**
 * Horizontal (desktop) / vertical (mobile) progress through the order flow,
 * followed by a detailed history list.
 */
export default function OrderTimeline({ order, showHistory = true, vertical = false, className }) {
  const cancelled = order.status === ORDER_STATUS.CANCELLED;
  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
  const reachedAt = (status) => order.statusHistory?.find((h) => h.status === status)?.at;

  return (
    <div className={className}>
      {cancelled ? (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4">
          <XCircle className="h-6 w-6 text-danger" />
          <div>
            <p className="font-semibold text-danger">Order cancelled</p>
            <p className="text-sm text-muted">{ORDER_STATUS_META.cancelled.description}</p>
          </div>
        </div>
      ) : (
        <ol className={clsx('grid gap-4', !vertical && 'sm:grid-cols-4')}>
          {ORDER_STATUS_FLOW.map((status, i) => {
            const Icon = ICONS[status];
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <li key={status} className={clsx('relative flex items-start gap-3', !vertical && 'sm:flex-col sm:items-center sm:text-center')}>
                {i < ORDER_STATUS_FLOW.length - 1 && (
                  <span
                    className={clsx(
                      'absolute left-5 top-10 h-full w-0.5',
                      !vertical && 'sm:left-[calc(50%+1.5rem)] sm:top-5 sm:h-0.5 sm:w-[calc(100%-3rem)]',
                      done ? 'bg-gradient-brand' : 'bg-line/20'
                    )}
                    aria-hidden="true"
                  />
                )}
                <span className={clsx('relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition', done ? 'border-transparent bg-gradient-brand text-white' : active ? 'border-brand-500 bg-surface text-brand-500 shadow-glow' : 'border-line/30 bg-surface text-muted')}>
                  {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </span>
                <div>
                  <p className={clsx('text-sm font-semibold', active ? 'text-brand-500' : done ? 'text-ink' : 'text-muted')}>{ORDER_STATUS_META[status].label}</p>
                  <p className="text-xs text-muted">{reachedAt(status) ? formatDateTime(reachedAt(status)) : active ? 'In progress' : 'Pending'}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {showHistory && order.statusHistory?.length > 0 && (
        <div className="mt-8">
          <h4 className="font-ui text-sm font-semibold uppercase tracking-wider text-muted">History</h4>
          <ul className="mt-3 space-y-3 border-l-2 border-line/20 pl-4">
            {[...order.statusHistory].reverse().map((h, i) => (
              <li key={i} className="relative text-sm">
                <span className={clsx('absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full', ORDER_STATUS_META[h.status]?.dot || 'bg-muted')} />
                <p className="font-medium text-ink">
                  {ORDER_STATUS_META[h.status]?.label || h.status}
                  <span className="ml-2 text-xs font-normal text-muted">{formatDateTime(h.at)}</span>
                </p>
                {h.note && <p className="text-xs text-muted">{h.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
