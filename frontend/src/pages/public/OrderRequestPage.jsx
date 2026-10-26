import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowLeft, Check, ClipboardList, PhoneCall, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import CartSummary from '@/components/cart/CartSummary';
import OrderRequestForm from '@/components/order/OrderRequestForm';
import PrescriptionBadge from '@/components/product/PrescriptionBadge';
import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/formatCurrency';

const STEPS = [
  { label: 'Cart', icon: ShoppingBag },
  { label: 'Details', icon: ClipboardList },
  { label: 'Confirmation', icon: PhoneCall },
];

function Stepper({ current = 2 }) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4" aria-label="Order progress">
      {STEPS.map(({ label, icon: Icon }, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition',
                  done ? 'border-transparent bg-gradient-brand text-white' : active ? 'border-brand-500 bg-surface text-brand-500 shadow-glow' : 'border-line bg-surface text-muted'
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className={clsx('text-sm font-semibold', active ? 'text-ink' : done ? 'text-ink/80' : 'text-muted', !active && 'hidden sm:inline')}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={clsx('h-0.5 w-6 rounded-pill sm:w-12', done ? 'bg-gradient-brand' : 'bg-line/30')} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderRequestPage() {
  const { items, isEmpty, hasPrescriptionItems, clearCart } = useCart();
  const { submit, submitting, error } = useCreateOrder();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  if (isEmpty && !done) return <Navigate to="/cart" replace />;

  const handleSubmit = async ({ customer }) => {
    const payload = {
      customer,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };
    try {
      const order = await submit(payload);
      setDone(true);
      navigate(`/order-confirmation/${order.trackingToken}`, { state: { order } });
      clearCart();
      toast.success('Order request sent. We will call you shortly.');
    } catch {
      /* serverError is shown inside the form */
    }
  };

  return (
    <div>
      <SEOHead title="Request your order" noIndex />

      <PageHero
        eyebrow="Step 2 of 3"
        title="Your"
        highlight="Details"
        subtitle="Tell us who to call and where to deliver. We confirm every request by phone before dispatch, and you pay on delivery."
        breadcrumbs={[
          { label: 'Cart', to: '/cart' },
          { label: 'Order request' },
        ]}
      />

      <section className="container py-10 md:py-14">
        <div className="mb-10 animate-fade-up">
          <Stepper current={2} />
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="card p-6 md:p-8">
              <OrderRequestForm onSubmit={handleSubmit} submitting={submitting} hasPrescriptionItems={hasPrescriptionItems} serverError={error} />
            </div>
            <div className="mt-6">
              <Link to="/cart" className="btn btn-ghost btn-md text-brand-500">
                <ArrowLeft className="h-4 w-4" /> Back to cart
              </Link>
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-5 lg:sticky lg:top-28 xl:col-span-4">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Your items</h3>
                <Link to="/cart" className="text-sm font-medium text-brand-500 hover:underline">
                  Edit
                </Link>
              </div>
              <ul className="mt-3 max-h-80 divide-y divide-line overflow-y-auto scrollbar-thin">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 py-3">
                    <span className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-ink">{item.name}</p>
                      <p className="flex items-center gap-2 text-xs text-muted">
                        {formatCurrency(item.price)} × {item.quantity}
                        {item.requiresPrescription && <PrescriptionBadge withText={false} />}
                      </p>
                    </div>
                    <p className="font-ui text-sm font-bold text-ink">{formatCurrency(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
            </div>
            <CartSummary />
          </aside>
        </div>
      </section>
    </div>
  );
}
