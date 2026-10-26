import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Search, Download, X } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import OrdersTable from '@/components/admin/OrdersTable';
import ErrorState from '@/components/admin/ErrorState';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/common/Button';
import { useAdminOrders } from '@/hooks/useOrders';
import { useDebounce } from '@/hooks/useDebounce';
import { useSocket } from '@/hooks/useSocket';
import { reportService } from '@/services/reportService';
import { ORDER_STATUS_META, ORDER_STATUS_OPTIONS } from '@/constants/orderStatus';
import { formatDateTime } from '@/utils/formatDate';

const LIMIT = 10;
const TABS = [{ value: '', label: 'All' }, ...ORDER_STATUS_OPTIONS];

const CSV_COLUMNS = [
  { label: 'Order #', key: 'orderNumber' },
  { label: 'Customer', value: (o) => o.customer?.name },
  { label: 'Phone', value: (o) => o.customer?.phone },
  { label: 'District', value: (o) => o.customer?.district },
  { label: 'Items', value: (o) => (o.items || []).reduce((s, i) => s + i.quantity, 0) },
  { label: 'Total (RWF)', key: 'total' },
  { label: 'Status', key: 'status' },
  { label: 'Prescription', value: (o) => (o.hasPrescriptionItems ? 'Yes' : 'No') },
  { label: 'Placed', value: (o) => formatDateTime(o.createdAt) },
];

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const urlQ = searchParams.get('q') || '';

  const [search, setSearch] = useState(urlQ);
  const debounced = useDebounce(search, 400);
  const [highlightId, setHighlightId] = useState(null);

  const update = useCallback(
    (patch, { resetPage = true } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Push the debounced search into the URL.
  useEffect(() => {
    if (debounced !== urlQ) update({ q: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const params = useMemo(() => ({ status, q: urlQ, from, to, page, limit: LIMIT }), [status, urlQ, from, to, page]);
  const { data: orders, meta, loading, error, refetch } = useAdminOrders(params);

  const onNewOrder = useCallback(
    (order) => {
      toast.success('New order received');
      setHighlightId(order?._id || null);
      refetch();
      setTimeout(() => setHighlightId(null), 6000);
    },
    [refetch]
  );
  useSocket(onNewOrder);

  const exportCsv = () => {
    if (!orders?.length) return toast.error('Nothing to export');
    const csv = reportService.toCsv(orders, CSV_COLUMNS);
    reportService.downloadCsv(`orders-${status || 'all'}-page${page}.csv`, csv);
    return null;
  };

  const hasFilters = status || urlQ || from || to;

  return (
    <div>
      <SEOHead title="Orders" noIndex />
      <PageHeader
        title="Order"
        highlight="requests"
        subtitle="Call each customer to confirm, then mark the order as delivered."
        actions={
          <Button variant="secondary" size="sm" icon={Download} onClick={exportCsv} disabled={!orders?.length}>
            Export CSV
          </Button>
        }
      />

      {/* Status tabs */}
      <div className="-mx-4 mb-4 overflow-x-auto px-4 scrollbar-thin md:mx-0 md:px-0">
        <div className="inline-flex min-w-full gap-1 rounded-pill bg-surface-2 p-1 md:min-w-0">
          {TABS.map((t) => {
            const active = status === t.value;
            const meta = ORDER_STATUS_META[t.value];
            return (
              <button
                key={t.value || 'all'}
                type="button"
                onClick={() => update({ status: t.value })}
                className={clsx('flex items-center gap-1.5 whitespace-nowrap rounded-pill px-4 py-2 font-ui text-xs font-semibold transition', active ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink')}
              >
                {meta && <span className={clsx('h-1.5 w-1.5 rounded-full', meta.dot)} />}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #, name or phone" className="input py-2.5 pl-9 text-sm" aria-label="Search orders" />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          From
          <input type="date" value={from} max={to || undefined} onChange={(e) => update({ from: e.target.value })} className="input py-2.5 text-sm" aria-label="From date" />
        </label>
        <label className="flex items-center gap-2 text-xs text-muted">
          To
          <input type="date" value={to} min={from || undefined} onChange={(e) => update({ to: e.target.value })} className="input py-2.5 text-sm" aria-label="To date" />
        </label>
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          disabled={!hasFilters}
          onClick={() => {
            setSearch('');
            setSearchParams({}, { replace: true });
          }}
        >
          Clear
        </Button>
      </div>

      {error ? (
        <div className="card">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : (
        <>
          <OrdersTable
            orders={orders || []}
            loading={loading && !(orders || []).length}
            highlightId={highlightId}
            emptyTitle={hasFilters ? 'No orders match these filters' : 'No orders yet'}
            emptyDescription={hasFilters ? 'Try widening the date range or clearing the search.' : undefined}
          />
          <Pagination className="mt-4" page={meta?.page || page} totalPages={meta?.totalPages || 1} total={meta?.total} limit={meta?.limit || LIMIT} onChange={(p) => update({ page: String(p) }, { resetPage: false })} />
        </>
      )}
    </div>
  );
}
