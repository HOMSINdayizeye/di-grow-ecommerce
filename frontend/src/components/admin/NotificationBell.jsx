import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Bell, ShoppingCart, AlertTriangle, Clock, CheckCheck } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useSocket } from '@/hooks/useSocket';
import { timeAgo } from '@/utils/formatDate';

const ICONS = { new_order: ShoppingCart, low_stock: AlertTriangle, stale_order: Clock };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await notificationService.list();
      setItems(res.data || []);
      setUnread(res.meta?.unread ?? (res.data || []).filter((n) => !n.isRead).length);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when a new order arrives via the socket.
  const onNewOrder = useCallback(() => load(), [load]);
  useSocket(onNewOrder);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markRead = async (n) => {
    if (n.isRead) return;
    setItems((list) => list.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await notificationService.markRead(n._id);
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    setItems((list) => list.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    try {
      await notificationService.markAllRead();
    } catch {
      /* ignore */
    }
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="relative rounded-full p-2.5 text-muted transition hover:bg-surface-2 hover:text-ink" aria-label={`Notifications, ${unread} unread`} aria-expanded={open}>
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="card absolute right-0 mt-2 w-80 overflow-hidden animate-fade-up sm:w-96">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h3 className="font-ui text-sm font-semibold">Notifications</h3>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto scrollbar-thin">
            {items.length === 0 && <li className="p-6 text-center text-sm text-muted">You are all caught up.</li>}
            {items.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              const inner = (
                <div className={clsx('flex gap-3 px-4 py-3 transition hover:bg-surface-2', !n.isRead && 'bg-brand-500/5')}>
                  <span className={clsx('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', n.type === 'new_order' ? 'bg-brand-500/15 text-brand-500' : n.type === 'low_stock' ? 'bg-danger/15 text-danger' : 'bg-gold-500/15 text-gold-500')}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={clsx('text-sm', !n.isRead ? 'font-semibold text-ink' : 'text-ink/80')}>{n.title}</p>
                    <p className="truncate text-xs text-muted">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent-500" />}
                </div>
              );
              return (
                <li key={n._id} className="border-b border-line last:border-0">
                  {n.orderId ? (
                    <Link to={`/admin/orders/${n.orderId}`} onClick={() => { markRead(n); setOpen(false); }}>
                      {inner}
                    </Link>
                  ) : (
                    <button type="button" className="w-full text-left" onClick={() => markRead(n)}>
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="border-t border-line px-4 py-2 text-center">
            <Link to="/admin/orders?status=new" onClick={() => setOpen(false)} className="text-xs font-medium text-brand-500 hover:underline">
              View new orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
