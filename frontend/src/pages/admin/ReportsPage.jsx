import { useMemo, useState } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { ShoppingCart, PackageCheck, XCircle, Wallet, Receipt, Percent, Download, TrendingUp, History } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import ErrorState from '@/components/admin/ErrorState';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { Skeleton, TableSkeleton } from '@/components/common/Loader';
import { CHART_COLORS, AXIS_TICK, AXIS_LINE, GRID_STROKE, TOOLTIP_STYLE } from '@/components/admin/chartTheme';
import { useFetch } from '@/hooks/useFetch';
import { reportService } from '@/services/reportService';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, formatDateTime } from '@/utils/formatDate';

const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};
const PRESETS = [
  { label: 'Last 7 days', get: () => ({ from: daysAgo(6), to: iso(new Date()) }) },
  { label: 'Last 30 days', get: () => ({ from: daysAgo(29), to: iso(new Date()) }) },
  { label: 'This month', get: () => ({ from: iso(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), to: iso(new Date()) }) },
  { label: 'All time', get: () => ({ from: '', to: '' }) },
];

const compact = (v) => formatCurrency(v, { compact: true }).replace('RWF ', '');

function ChartCard({ title, subtitle, children, className, action }) {
  return (
    <div className={clsx('card p-5', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-ui text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function ReportsPage() {
  const [range, setRange] = useState(PRESETS[1].get());
  const { from, to } = range;
  const { data, loading, error, refetch } = useFetch(() => reportService.summary({ from, to }), [from, to]);
  const audit = useFetch(() => reportService.auditLogs(), [], { initialData: [] });

  const summary = data?.summary || {};
  const byDay = useMemo(() => (data?.byDay || []).map((d) => ({ ...d, label: formatDate(d.date, { year: undefined }) })), [data]);
  const byCategory = data?.byCategory || [];
  const byDistrict = data?.byDistrict || [];
  const topProducts = data?.topProducts || [];
  const activePreset = PRESETS.find((p) => {
    const r = p.get();
    return r.from === from && r.to === to;
  })?.label;

  const exportTop = () => {
    if (!topProducts.length) return toast.error('Nothing to export');
    const csv = reportService.toCsv(topProducts, [
      { label: 'Product', key: 'name' },
      { label: 'Qty sold', key: 'qty' },
      { label: 'Revenue (RWF)', key: 'revenue' },
    ]);
    reportService.downloadCsv(`top-products-${from || 'all'}-${to || 'now'}.csv`, csv);
    return null;
  };

  const busy = loading && !data;
  const rangeLabel = from || to ? `${from ? formatDate(from) : 'Start'} – ${to ? formatDate(to) : 'Today'}` : 'All time';

  return (
    <div className="space-y-6">
      <SEOHead title="Reports" noIndex />
      <PageHeader title="Sales" highlight="reports" subtitle="Delivered orders count as revenue. Cancelled orders are excluded." />

      {/* Range controls */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="flex flex-wrap gap-1 rounded-pill bg-surface-2 p-1">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => setRange(p.get())} className={clsx('rounded-pill px-3 py-1.5 font-ui text-xs font-semibold transition', activePreset === p.label ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink')}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-muted">
          <label className="flex items-center gap-2">
            From
            <input type="date" value={from} max={to || undefined} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className="input py-2 text-sm" aria-label="From date" />
          </label>
          <label className="flex items-center gap-2">
            To
            <input type="date" value={to} min={from || undefined} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className="input py-2 text-sm" aria-label="To date" />
          </label>
        </div>
      </div>

      {error ? (
        <div className="card">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : (
        <>
          {busy ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              <StatCard title="Orders" value={summary.orders ?? 0} icon={ShoppingCart} tone="brand" />
              <StatCard title="Delivered" value={summary.delivered ?? 0} icon={PackageCheck} tone="success" />
              <StatCard title="Cancelled" value={summary.cancelled ?? 0} icon={XCircle} tone={summary.cancelled > 0 ? 'danger' : 'brand'} />
              <StatCard title="Revenue" value={formatCurrency(summary.revenue ?? 0, { compact: true })} icon={Wallet} tone="accent" />
              <StatCard title="Avg. order value" value={formatCurrency(summary.avgOrderValue ?? 0, { compact: true })} icon={Receipt} tone="gold" />
              <StatCard title="Conversion" value={`${summary.conversion ?? 0}%`} icon={Percent} tone="success" delta="delivered / all" />
            </div>
          )}

          <ChartCard title="Orders & revenue by day" subtitle={rangeLabel}>
            {busy ? (
              <Skeleton className="h-72 w-full" />
            ) : byDay.length === 0 ? (
              <EmptyState compact title="No orders in this range" description="Try a wider date range." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={byDay} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} minTickGap={24} />
                    <YAxis yAxisId="orders" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
                    <YAxis yAxisId="revenue" orientation="right" tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={compact} width={52} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => (name === 'Revenue' ? [formatCurrency(v), name] : [v, name])} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#9aa3b2' }} />
                    <Line yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke={CHART_COLORS.brand} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'rgb(var(--c-surface))' }} />
                    <Line yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS.accent} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'rgb(var(--c-surface))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Revenue by category" subtitle="Delivered orders">
              {busy ? (
                <Skeleton className="h-64 w-full" />
              ) : byCategory.length === 0 ? (
                <EmptyState compact title="No revenue yet" />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byCategory} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} barCategoryGap="28%">
                      <CartesianGrid horizontal={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                      <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={compact} />
                      <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={110} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [formatCurrency(v), 'Revenue']} />
                      <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.brand} radius={[0, 4, 4, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Orders by district" subtitle="Where customers order from">
              {busy ? (
                <Skeleton className="h-64 w-full" />
              ) : byDistrict.length === 0 ? (
                <EmptyState compact title="No orders yet" />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byDistrict} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
                      <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="orders" name="Orders" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </div>

          <ChartCard
            title="Top products"
            subtitle="By revenue, delivered orders"
            action={
              <Button variant="secondary" size="sm" icon={Download} onClick={exportTop} disabled={!topProducts.length}>
                Export CSV
              </Button>
            }
          >
            {busy ? (
              <TableSkeleton rows={5} cols={3} />
            ) : topProducts.length === 0 ? (
              <EmptyState compact icon={TrendingUp} title="No sales in this range" />
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line font-ui text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-3 py-2 font-semibold">#</th>
                      <th className="px-3 py-2 font-semibold">Product</th>
                      <th className="px-3 py-2 text-right font-semibold">Qty</th>
                      <th className="px-3 py-2 text-right font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/10">
                    {topProducts.map((p, i) => (
                      <tr key={p.name}>
                        <td className="px-3 py-2.5 text-muted">{i + 1}</td>
                        <td className="px-3 py-2.5 font-medium text-ink">{p.name}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted">{p.qty}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-ink">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </>
      )}

      {/* Audit log */}
      <ChartCard title="Audit log" subtitle="Recent changes made by the team">
        {audit.error ? (
          <ErrorState compact message={audit.error.message} onRetry={audit.refetch} />
        ) : audit.loading && !(audit.data || []).length ? (
          <TableSkeleton rows={4} cols={4} />
        ) : (audit.data || []).length === 0 ? (
          <EmptyState compact icon={History} title="No activity recorded" />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line font-ui text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">When</th>
                  <th className="px-3 py-2 font-semibold">Who</th>
                  <th className="px-3 py-2 font-semibold">Action</th>
                  <th className="px-3 py-2 font-semibold">Target</th>
                  <th className="px-3 py-2 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/10">
                {(audit.data || []).map((a) => (
                  <tr key={a._id}>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted">{formatDateTime(a.createdAt)}</td>
                    <td className="px-3 py-2.5 font-medium text-ink">{a.actor}</td>
                    <td className="px-3 py-2.5">
                      <span className="badge border border-brand-500/30 bg-brand-500/10 font-mono text-[11px] text-brand-500">{a.action}</span>
                    </td>
                    <td className="px-3 py-2.5 text-ink">{a.target}</td>
                    <td className="px-3 py-2.5 text-muted">{a.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
