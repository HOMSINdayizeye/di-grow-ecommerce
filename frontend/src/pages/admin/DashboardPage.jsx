import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Inbox, Wallet, Package, AlertTriangle, Users, ArrowRight, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SEOHead from '@/seo/SEOHead';
import StatCard from '@/components/admin/StatCard';
import OrdersTable from '@/components/admin/OrdersTable';
import ErrorState from '@/components/admin/ErrorState';
import { Skeleton } from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { CHART_COLORS, STATUS_COLORS, AXIS_TICK, AXIS_LINE, GRID_STROKE, TOOLTIP_STYLE } from '@/components/admin/chartTheme';
import { useFetch } from '@/hooks/useFetch';
import { useSocket } from '@/hooks/useSocket';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { reportService } from '@/services/reportService';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_META } from '@/constants/orderStatus';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

function ChartCard({ title, subtitle, children, className }) {
  return (
    <div className={`card p-5 ${className || ''}`}>
      <div className="mb-4">
        <h3 className="font-ui text-sm font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-5">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="mt-4 h-7 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAdminAuth();
  const { data, loading, error, refetch } = useFetch(() => reportService.dashboard(), []);
  const onNewOrder = useCallback(() => refetch(), [refetch]);
  useSocket(onNewOrder);

  const totals = data?.totals || {};
  const series = data?.series || [];
  const byStatus = (data?.byStatus || []).filter((s) => s.count > 0);
  const topProducts = data?.topProducts || [];
  const recentOrders = data?.recentOrders || [];
  const statusTotal = byStatus.reduce((s, x) => s + x.count, 0);

  return (
    <div className="space-y-6">
      <SEOHead title="Dashboard" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">
            {greeting()}, <span className="text-gradient">{user?.name?.split(' ')[0] || 'there'}</span>
          </h2>
          <p className="mt-1 text-sm text-muted">{formatDate(new Date(), { weekday: 'long' })} · Here is what is happening at Di-Grow today.</p>
        </div>
        <Link to="/admin/orders?status=new" className="btn btn-primary btn-sm">
          Review new orders <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {error ? (
        <div className="card">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : loading && !data ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Orders today" value={totals.ordersToday ?? 0} icon={ShoppingCart} tone="brand" />
          <StatCard title="New orders" value={totals.newOrders ?? 0} icon={Inbox} tone="accent" to="/admin/orders?status=new" />
          <StatCard title="Revenue (delivered)" value={formatCurrency(totals.revenue ?? 0, { compact: true })} icon={Wallet} tone="success" />
          <StatCard title="Products" value={totals.products ?? 0} icon={Package} tone="brand" to="/admin/products" />
          <StatCard title="Low stock" value={totals.lowStock ?? 0} icon={AlertTriangle} tone={totals.lowStock > 0 ? 'danger' : 'success'} to="/admin/products?stock=low" />
          <StatCard title="Customers" value={totals.customers ?? 0} icon={Users} tone="gold" />
        </div>
      )}

      {!error && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Orders · last 14 days" subtitle="All order requests received per day" className="lg:col-span-2">
              {loading && !data ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dgOrdersFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={0.45} />
                          <stop offset="100%" stopColor={CHART_COLORS.brand} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Area type="monotone" dataKey="orders" name="Orders" stroke={CHART_COLORS.brand} strokeWidth={2} fill="url(#dgOrdersFill)" activeDot={{ r: 5, strokeWidth: 2, stroke: 'rgb(var(--c-surface))' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Orders by status" subtitle={`${statusTotal} orders in total`}>
              {loading && !data ? (
                <Skeleton className="h-64 w-full" />
              ) : byStatus.length === 0 ? (
                <EmptyState compact title="No orders yet" description="The breakdown appears once orders arrive." />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byStatus} dataKey="count" nameKey="status" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="rgb(var(--c-surface))" strokeWidth={2}>
                        {byStatus.map((s) => (
                          <Cell key={s.status} fill={STATUS_COLORS[s.status] || '#9aa3b2'} />
                        ))}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [v, ORDER_STATUS_META[name]?.label || name]} />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#9aa3b2', fontSize: 12 }}>{ORDER_STATUS_META[v]?.label || v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Revenue by day" subtitle="Delivered orders only" className="lg:col-span-2">
              {loading && !data ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
                      <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true }).replace('RWF ', '')} width={48} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [formatCurrency(v), 'Revenue']} />
                      <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Top products" subtitle="By quantity delivered">
              {loading && !data ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <EmptyState compact icon={TrendingUp} title="No sales yet" description="Top sellers show up after the first deliveries." />
              ) : (
                <ol className="space-y-3">
                  {topProducts.map((p, i) => (
                    <li key={p.name} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-soft font-ui text-xs font-bold text-brand-500">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-muted">{p.qty} sold</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-ink">{formatCurrency(p.revenue, { compact: true })}</span>
                    </li>
                  ))}
                </ol>
              )}
            </ChartCard>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-ui text-sm font-semibold text-ink">Recent orders</h3>
              <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:underline">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <OrdersTable orders={recentOrders} loading={loading && !data} />
          </div>
        </>
      )}
    </div>
  );
}
