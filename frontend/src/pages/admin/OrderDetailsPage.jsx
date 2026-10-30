import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Phone, Mail, MapPin, StickyNote, Save, Package } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import ErrorState from '@/components/admin/ErrorState';
import PrescriptionBadge from '@/components/product/PrescriptionBadge';
import Button from '@/components/common/Button';
import { Skeleton } from '@/components/common/Loader';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useAdminOrder } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { SITE } from '@/constants/site';

const waLinkTo = (phone, message) => {
  const digits = String(phone || '').replace(/\D/g, '');
  const intl = digits.length === 9 ? `250${digits}` : digits.startsWith('0') ? `250${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
};

function DetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: order, loading, error, refetch, saving, updateStatus, updateNotes } = useAdminOrder(id);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(order?.adminNotes || '');
  }, [order?.adminNotes]);

  const c = order?.customer || {};
  const waMessage = order
    ? `Hello ${c.name || ''}, this is ${SITE.name}. We are calling about your order ${order.orderNumber} (${formatCurrency(order.total)}). `
    : '';

  return (
    <div>
      <SEOHead title={order ? `Order ${order.orderNumber}` : 'Order'} noIndex />

      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-brand-500 print:hidden">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {error ? (
        <div className="card">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : loading || !order ? (
        <DetailsSkeleton />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl font-bold">
                  Order <span className="text-gradient">{order.orderNumber}</span>
                </h2>
                <OrderStatusBadge status={order.status} size="md" />
                {order.hasPrescriptionItems && <PrescriptionBadge size="md" />}
              </div>
              <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)} · last updated {formatDateTime(order.updatedAt)}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
                Print
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              <div className="card overflow-hidden">
                <div className="border-b border-line px-5 py-3">
                  <h3 className="font-ui text-sm font-semibold">Items ({order.items.length})</h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="hidden bg-surface-2/60 font-ui text-xs uppercase tracking-wider text-muted sm:table-header-group">
                    <tr>
                      <th className="px-5 py-2 text-left font-semibold">Product</th>
                      <th className="px-3 py-2 text-right font-semibold">Qty</th>
                      <th className="px-3 py-2 text-right font-semibold">Price</th>
                      <th className="px-5 py-2 text-right font-semibold">Line total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/10">
                    {order.items.map((item, i) => (
                      <tr key={`${item.product}-${i}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg border border-line object-cover" />
                            ) : (
                              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-2 text-muted">
                                <Package className="h-5 w-5" />
                              </span>
                            )}
                            <div className="min-w-0">
                              <Link to={`/product/${item.slug}`} target="_blank" className="block font-medium text-ink hover:text-brand-500">
                                {item.name}
                              </Link>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                                {item.requiresPrescription && <PrescriptionBadge />}
                                <span className="sm:hidden">
                                  {item.quantity} × {formatCurrency(item.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-3 py-3 text-right tabular-nums text-muted sm:table-cell">{item.quantity}</td>
                        <td className="hidden px-3 py-3 text-right tabular-nums text-muted sm:table-cell">{formatCurrency(item.price)}</td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-line bg-surface-2/40 px-5 py-4">
                  <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted">
                      <dt>Subtotal</dt>
                      <dd className="tabular-nums">{formatCurrency(order.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-muted">
                      <dt>Delivery</dt>
                      <dd className="tabular-nums">{order.deliveryFee ? formatCurrency(order.deliveryFee) : 'Free'}</dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-2 font-display text-lg font-bold text-ink">
                      <dt>Total</dt>
                      <dd className="tabular-nums">{formatCurrency(order.total)}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-right text-xs text-muted">Paid on delivery (cash or mobile money)</p>
                </div>
              </div>

              {/* Customer */}
              <div className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-ui text-sm font-semibold">Customer</h3>
                    <p className="mt-1 font-display text-lg font-bold">{c.name}</p>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <a href={`tel:${c.phone}`} className="btn btn-secondary btn-sm">
                      <Phone className="h-4 w-4" /> Call
                    </a>
                    <a href={waLinkTo(c.phone, waMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                      <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                    </a>
                  </div>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                    <div>
                      <dt className="text-xs text-muted">Phone</dt>
                      <dd>
                        <a href={`tel:${c.phone}`} className="font-medium text-ink hover:text-brand-500">
                          {c.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                    <div>
                      <dt className="text-xs text-muted">Email</dt>
                      <dd className="font-medium text-ink">{c.email ? <a href={`mailto:${c.email}`} className="hover:text-brand-500">{c.email}</a> : <span className="text-muted">Not provided</span>}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                    <div>
                      <dt className="text-xs text-muted">Delivery address</dt>
                      <dd className="font-medium text-ink">
                        {[c.district, c.sector].filter(Boolean).join(' · ')}
                        {c.address && <span className="block font-normal text-muted">{c.address}</span>}
                        {!c.district && !c.sector && !c.address && <span className="text-gold-500">Not given yet: agree the delivery place with the customer on WhatsApp</span>}
                      </dd>
                    </div>
                  </div>
                  {c.notes && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <StickyNote className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-500" />
                      <div>
                        <dt className="text-xs text-muted">Customer notes</dt>
                        <dd className="rounded-xl bg-accent-500/10 p-3 text-ink">{c.notes}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div className="card p-5 print:hidden">
                <h3 className="font-ui text-sm font-semibold">Update status</h3>
                <p className="mb-4 text-xs text-muted">The customer sees this on the tracking page.</p>
                <OrderStatusSelect value={order.status} onChange={updateStatus} loading={saving} />
              </div>

              <div className="card p-5">
                <h3 className="mb-4 font-ui text-sm font-semibold">Progress</h3>
                <OrderTimeline order={order} vertical />
              </div>

              <div className="card p-5 print:hidden">
                <h3 className="font-ui text-sm font-semibold">Admin notes</h3>
                <p className="mb-3 text-xs text-muted">Internal only. Not visible to the customer.</p>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="input min-h-[110px] resize-y" placeholder="e.g. Prescription verified by Dr. Aline. Deliver after 2 PM." />
                <div className="mt-3 flex justify-end">
                  <Button size="sm" icon={Save} loading={saving} disabled={notes === (order.adminNotes || '')} onClick={() => updateNotes(notes)}>
                    Save notes
                  </Button>
                </div>
              </div>
              {order.adminNotes && (
                <div className="hidden print:block">
                  <h3 className="font-ui text-sm font-semibold">Admin notes</h3>
                  <p className="text-sm text-muted">{order.adminNotes}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
