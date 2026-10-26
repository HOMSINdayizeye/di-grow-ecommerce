import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowRight, Check, Copy, FileCheck2, MapPin, PackageSearch, PhoneCall, SearchX, Truck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '@/seo/SEOHead';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import PrescriptionBadge from '@/components/product/PrescriptionBadge';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useFetch } from '@/hooks/useFetch';
import { orderService } from '@/services/orderService';
import { whatsappLink } from '@/constants/site';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';

export default function OrderConfirmationPage() {
  const { token } = useParams();
  const location = useLocation();
  const stateOrder = location.state?.order;
  const { data, loading, error } = useFetch(() => orderService.getByToken(token), [token], { enabled: !stateOrder && !!token });
  const order = stateOrder || data;

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      toast.success('Order number copied');
    } catch {
      toast.error('Could not copy. Please write the number down.');
    }
  };

  if (error) {
    return (
      <div className="container section">
        <SEOHead title="Order not found" noIndex />
        <EmptyState
          icon={SearchX}
          title={error.status === 404 ? 'Order not found' : "We couldn't load this order"}
          description={error.status === 404 ? 'This confirmation link is invalid or has expired. You can still track your order with its number and your phone.' : error.message}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button to="/track-order" size="md" icon={PackageSearch}>
                Track an order
              </Button>
              <Button to="/shop" variant="secondary" size="md">
                Back to shop
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (loading || !order) {
    return (
      <div>
        <SEOHead title="Order confirmation" noIndex />
        <Loader full label="Loading your order…" />
      </div>
    );
  }

  const { customer = {} } = order;
  const trackHref = `/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(customer.phone || '')}`;
  const waHref = whatsappLink(`Hello Di-Grow, I just sent order request ${order.orderNumber}. Please confirm when you can deliver.`);

  return (
    <div>
      <SEOHead title={`Request received · ${order.orderNumber}`} noIndex />

      {/* Success hero */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-hero text-white">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full glow-brand blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full glow-accent blur-3xl" />
        <div className="container relative py-14 text-center md:py-20">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-brand shadow-glow animate-fade-up">
            <Check className="h-12 w-12" strokeWidth={3} />
          </div>
          <span className="eyebrow mt-6 animate-fade-up" style={{ animationDelay: '80ms' }}>
            Step 3 of 3
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-balance animate-fade-up md:text-5xl lg:text-6xl" style={{ animationDelay: '120ms' }}>
            Request <span className="text-gradient">received!</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75 animate-fade-up md:text-lg" style={{ animationDelay: '180ms' }}>
            Thank you, {customer.name?.split(' ')[0] || 'friend'}. Your order number is below. Keep it to track your delivery.
          </p>

          <div className="glass mx-auto mt-8 inline-flex max-w-full items-center gap-3 rounded-pill py-2 pl-5 pr-2 shadow-card animate-fade-up" style={{ animationDelay: '240ms' }}>
            <span className="text-xs uppercase tracking-wider text-white/60">Order</span>
            <span className="font-ui text-lg font-bold tracking-wide text-white sm:text-xl">{order.orderNumber}</span>
            <button type="button" onClick={copyNumber} className="inline-flex items-center gap-1.5 rounded-pill bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20" aria-label="Copy order number">
              <Copy className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Copy</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Link to={trackHref} className="btn btn-primary btn-lg">
              <PackageSearch className="h-5 w-5" /> Track this order
            </Link>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
              <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
            </a>
            <Link to="/shop" className="btn btn-secondary btn-lg !text-white">
              Continue shopping <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        {/* What happens next */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: PhoneCall, title: 'We call you within a few hours', text: `A team member will call or WhatsApp ${customer.phone || 'your number'} to confirm the items, total and a delivery time that suits you.` },
            ...(order.hasPrescriptionItems
              ? [{ icon: FileCheck2, title: 'Prescription check', text: 'Your request includes prescription items. Please send a clear photo of your prescription on WhatsApp when we call so our pharmacist can verify it.', accent: true }]
              : [{ icon: Truck, title: 'Prepared and dispatched', text: 'Once confirmed, we pack your order and a rider brings it to your address in Kigali, usually the same day.' }]),
            { icon: Check, title: 'Pay on delivery', text: `Pay ${formatCurrency(order.total)} in cash or mobile money when your order arrives. Nothing is charged online.` },
          ].map(({ icon: Icon, title, text, accent }, i) => (
            <div key={title} className="card p-6 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${accent ? 'bg-accent-500/15 text-accent-500' : 'bg-gradient-soft text-brand-500'}`}>
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="card mt-8 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Order status</h2>
              <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
            </div>
            <OrderStatusBadge status={order.status} size="md" />
          </div>
          <OrderTimeline order={order} showHistory={false} className="mt-8" />
        </div>

        {/* Summary */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="card overflow-hidden lg:col-span-8">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-xl font-bold">Order summary</h2>
            </div>
            <ul className="divide-y divide-line px-5">
              {order.items.map((item, i) => (
                <li key={`${item.product}-${i}`} className="flex items-center gap-4 py-4">
                  <Link to={`/product/${item.slug}`} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </Link>
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
                <dt className="font-semibold">Total to pay on delivery</dt>
                <dd className="font-ui text-xl font-bold text-ink">{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4 lg:col-span-4">
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                <User className="h-5 w-5 text-brand-500" /> Customer
              </h3>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Name</dt>
                  <dd className="text-right font-medium">{customer.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Phone</dt>
                  <dd className="text-right font-medium">{customer.phone}</dd>
                </div>
                {customer.email && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Email</dt>
                    <dd className="break-all text-right font-medium">{customer.email}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                <MapPin className="h-5 w-5 text-brand-500" /> Delivery address
              </h3>
              <p className="mt-3 text-sm font-medium text-ink">{customer.address}</p>
              <p className="text-sm text-muted">
                {[customer.sector, customer.district].filter(Boolean).join(', ')}
                {customer.district ? ', Kigali' : ''}
              </p>
              {customer.notes && (
                <p className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-muted">
                  <span className="font-semibold text-ink">Notes:</span> {customer.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
