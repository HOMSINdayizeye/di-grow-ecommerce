import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, HelpCircle, MapPin, PackageSearch } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import Loader from '@/components/common/Loader';
import TrackOrderForm from '@/components/order/TrackOrderForm';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import PrescriptionBadge from '@/components/product/PrescriptionBadge';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useTrackOrder } from '@/hooks/useOrders';
import { useReveal } from '@/hooks/useReveal';
import { whatsappLink } from '@/constants/site';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';

const FAQ = [
  {
    q: 'Where do I find my order number?',
    a: 'It was shown on the confirmation page right after you sent your request (it looks like DG-20260101-1001). If you gave us an email address, it is also in your confirmation email.',
  },
  {
    q: 'I lost the number. Can I still track my order?',
    a: 'Yes. Check the SMS or WhatsApp message our team sent when we called to confirm, or message us on WhatsApp with the phone number you ordered with and we will look it up.',
  },
  {
    q: 'Which phone number should I enter?',
    a: 'The number you typed on the order request form. We match it to the order for your privacy, so a different number will not work.',
  },
];

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || '';
  const phone = searchParams.get('phone') || '';
  const { order, loading, error, track } = useTrackOrder();
  const resultRef = useRef(null);
  const autoRan = useRef(false);
  const ref = useReveal();

  /* Auto-submit when arriving from the confirmation page with both values. */
  useEffect(() => {
    if (autoRan.current || !orderNumber || !phone) return;
    autoRan.current = true;
    track({ orderNumber, phone });
  }, [orderNumber, phone, track]);

  useEffect(() => {
    if (order) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [order]);

  const waHref = whatsappLink(order ? `Hello Di-Grow, I need help with my order ${order.orderNumber}.` : 'Hello Di-Grow, I need help tracking my order.');

  return (
    <div ref={ref}>
      <SEOHead title="Track your order" description="Enter your Di-Grow order number and phone number to see the live status of your delivery in Kigali." />

      <PageHero eyebrow="Order status" title="Track" highlight="Your Order" subtitle="Enter the order number from your confirmation and the phone number you ordered with." breadcrumbs={[{ label: 'Track order' }]} />

      <section className="container py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="card p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-soft text-brand-500">
                  <PackageSearch className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold">Find your order</h2>
                  <p className="text-sm text-muted">Both fields are required.</p>
                </div>
              </div>
              <TrackOrderForm onSubmit={track} loading={loading} defaultValues={{ orderNumber, phone }} className="mt-6" />

              {error && (
                <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
                  <div>
                    <p className="font-semibold text-danger">{error}</p>
                    <p className="mt-1 text-muted">Check the order number and phone number, or contact us on WhatsApp and we will find it for you.</p>
                  </div>
                </div>
              )}
            </div>

            {loading && !order && (
              <div className="card mt-6 p-8">
                <Loader label="Looking up your order…" className="w-full" />
              </div>
            )}

            {order && (
              <div ref={resultRef} className="mt-6 scroll-mt-28 space-y-6 animate-fade-up">
                <div className="card p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Order</p>
                      <h3 className="font-ui text-2xl font-bold tracking-wide text-ink">{order.orderNumber}</h3>
                      <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} size="md" />
                  </div>
                  <OrderTimeline order={order} showHistory className="mt-8" />
                </div>

                <div className="grid gap-6 md:grid-cols-5">
                  <div className="card overflow-hidden md:col-span-3">
                    <div className="border-b border-line px-5 py-4">
                      <h3 className="font-display text-lg font-bold">Items</h3>
                    </div>
                    <ul className="divide-y divide-line px-5">
                      {order.items.map((item, i) => (
                        <li key={`${item.product}-${i}`} className="flex items-center gap-3 py-3">
                          <span className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-2">
                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link to={`/product/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand-500">
                              {item.name}
                            </Link>
                            <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                              {formatCurrency(item.price)} × {item.quantity}
                              {item.requiresPrescription && <PrescriptionBadge />}
                            </p>
                          </div>
                          <p className="font-ui text-sm font-bold text-ink">{formatCurrency(item.price * item.quantity)}</p>
                        </li>
                      ))}
                    </ul>
                    <dl className="space-y-2 border-t border-line bg-surface-2/50 px-5 py-4 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted">Subtotal</dt>
                        <dd className="font-medium">{formatCurrency(order.subtotal)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted">Delivery</dt>
                        <dd className={order.deliveryFee === 0 ? 'font-medium text-success' : 'font-medium'}>{order.deliveryFee === 0 ? 'Free' : formatCurrency(order.deliveryFee)}</dd>
                      </div>
                      <div className="flex justify-between border-t border-line pt-3 text-base">
                        <dt className="font-semibold">Total on delivery</dt>
                        <dd className="font-ui text-xl font-bold text-ink">{formatCurrency(order.total)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <div className="card p-5">
                      <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                        <MapPin className="h-5 w-5 text-brand-500" /> Delivery address
                      </h3>
                      <p className="mt-3 text-sm font-medium text-ink">{order.customer?.name}</p>
                      <p className="text-sm text-muted">{order.customer?.address || 'To be agreed with you on WhatsApp'}</p>
                      <p className="text-sm text-muted">
                        {[order.customer?.sector, order.customer?.district].filter(Boolean).join(', ')}
                        {order.customer?.district ? ', Kigali' : ''}
                      </p>
                    </div>
                    <div className="card relative overflow-hidden p-5">
                      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full glow-brand blur-2xl" />
                      <h3 className="relative font-display text-lg font-bold">Need help?</h3>
                      <p className="relative mt-2 text-sm text-muted">Questions about timing, a change of address or a product? Message us and quote your order number.</p>
                      <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-md relative mt-4 w-full">
                        <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="card reveal p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                <HelpCircle className="h-5 w-5 text-brand-500" /> Frequently asked
              </h3>
              <ul className="mt-4 divide-y divide-line">
                {FAQ.map((f) => (
                  <li key={f.q} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold text-ink">{f.q}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{f.a}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-sm text-muted">Still stuck? We are happy to help.</p>
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm mt-3">
                  <WhatsAppIcon className="h-4 w-4 text-[#25d366]" /> Message us
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
