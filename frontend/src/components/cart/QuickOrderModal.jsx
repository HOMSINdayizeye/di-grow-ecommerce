import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { X, Check, Copy, ArrowRight, Mail, PhoneCall, ShoppingBag, AlertTriangle, RefreshCw } from 'lucide-react';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useCart } from '@/hooks/useCart';
import { useSettings } from '@/hooks/useSettings';
import { orderService } from '@/services/orderService';
import { getErrorMessage } from '@/services/api';
import { quickOrderSchema } from '@/validations/quickOrderSchema';
import { normalisePhone } from '@/validations/orderRequestSchema';
import { formatCurrency } from '@/utils/formatCurrency';
import { whatsappLink } from '@/constants/site';
import { getItem, setItem } from '@/utils/storage';

const REMEMBER_KEY = 'customer';
const STEP = { PREPARING: 'preparing', DETAILS: 'details', SENDING: 'sending', DONE: 'done', ERROR: 'error' };

/** Large, unmistakable loading state. */
function BigLoader({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center" role="status" aria-live="polite">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/20" />
        <span className="absolute inset-2 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500" />
        <ShoppingBag className="h-8 w-8 text-brand-500" />
      </div>
      <h3 className="mt-6 font-display text-2xl font-bold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-muted">{subtitle}</p>
      <div className="mt-6 h-1.5 w-56 overflow-hidden rounded-pill bg-surface-2">
        <div className="h-full w-1/2 animate-[marquee_1.2s_linear_infinite] rounded-pill bg-gradient-brand" style={{ animationDirection: 'reverse' }} />
      </div>
    </div>
  );
}

function buildWhatsAppMessage(order) {
  const lines = order.items.map((i) => `- ${i.name} x ${i.quantity} (${formatCurrency(i.price * i.quantity)})`);
  return [
    `Hello Di-Grow, I have just placed order ${order.orderNumber}.`,
    '',
    'Items:',
    ...lines,
    '',
    `Total: ${formatCurrency(order.total)}`,
    `Email: ${order.customer?.email || ''}`,
    `Phone: ${order.customer?.phone || ''}`,
    '',
    'Please confirm my delivery. Thank you!',
  ].join('\n');
}

/**
 * "Order now" flow from the mini cart:
 *   preparing (loader) -> details (email + phone) -> sending (loader) -> done (order number + WhatsApp)
 */
export default function QuickOrderModal({ open, onClose }) {
  const { items, subtotal, hasPrescriptionItems, clearCart } = useCart();
  const { settings } = useSettings();
  const [step, setStep] = useState(STEP.PREPARING);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const snapshot = useRef([]);
  const remembered = getItem(REMEMBER_KEY, {});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quickOrderSchema),
    defaultValues: { email: remembered.email || '', phone: remembered.phone || '', name: remembered.name || '' },
  });

  // Reset and run the "preparing" step each time the modal opens.
  useEffect(() => {
    if (!open) return undefined;
    snapshot.current = items;
    setStep(STEP.PREPARING);
    setOrder(null);
    setError('');
    setCopied(false);
    const t = setTimeout(() => setStep(STEP.DETAILS), 1400);
    const onKey = (e) => e.key === 'Escape' && step !== STEP.SENDING && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const freeAt = Number(settings.freeDeliveryThreshold) || 0;
  const deliveryFee = freeAt && subtotal >= freeAt ? 0 : Number(settings.deliveryFee) || 0;

  const submit = async (values) => {
    setStep(STEP.SENDING);
    setError('');
    const customer = {
      name: values.name || 'Customer',
      phone: normalisePhone(values.phone),
      email: values.email,
      district: '',
      sector: '',
      address: 'To be confirmed by phone or WhatsApp',
      notes: 'Quick order from the cart. Please confirm the delivery address with the customer.',
    };
    setItem(REMEMBER_KEY, { ...remembered, name: values.name || remembered.name || '', phone: values.phone, email: values.email });
    try {
      const res = await orderService.create({
        customer,
        items: snapshot.current.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      setOrder(res.data);
      clearCart();
      setStep(STEP.DONE);
    } catch (err) {
      setError(getErrorMessage(err, 'We could not send your order. Please try again.'));
      setStep(STEP.ERROR);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      toast.success('Order number copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!open) return null;
  const busy = step === STEP.PREPARING || step === STEP.SENDING;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Order now">
      <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm animate-fade-in" onClick={busy ? undefined : onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-xl3 border bg-surface shadow-float animate-fade-up sm:m-4 sm:rounded-xl3" style={{ borderColor: 'var(--glass-border)' }}>
        {!busy && (
          <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        )}

        {step === STEP.PREPARING && <BigLoader title="Preparing your order…" subtitle="Checking the items in your cart and the delivery fee." />}
        {step === STEP.SENDING && <BigLoader title="Sending your order request…" subtitle="Hold on a moment, we are generating your order number." />}

        {step === STEP.DETAILS && (
          <form onSubmit={handleSubmit(submit)} noValidate className="p-6">
            <span className="eyebrow">Almost done</span>
            <h3 className="mt-3 font-display text-2xl font-bold">Where should we send your order number?</h3>
            <p className="mt-1 text-sm text-muted">We email the order number and call this phone to confirm the delivery address. No payment online.</p>

            <div className="mt-5 space-y-4">
              <FormField label="Email" required type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
              <FormField label="Phone / WhatsApp number" required type="tel" placeholder="078 123 4567" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
              <FormField label="Name (optional)" placeholder="Your name" autoComplete="name" error={errors.name?.message} {...register('name')} />
            </div>

            <div className="mt-5 rounded-xl bg-surface-2 p-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>{snapshot.current.reduce((s, i) => s + i.quantity, 0)} items</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery (Kigali)</span>
                <span className={clsx(deliveryFee === 0 && 'text-success')}>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold">
                <span>Total on delivery</span>
                <span className="font-ui text-lg">{formatCurrency(subtotal + deliveryFee)}</span>
              </div>
              {hasPrescriptionItems && <p className="mt-2 text-xs text-accent-600">Includes prescription items. Our pharmacist will ask for a photo of your prescription on WhatsApp.</p>}
            </div>

            <Button type="submit" size="lg" className="mt-5 w-full" iconRight={ArrowRight}>
              Get my order number
            </Button>
            <p className="mt-3 text-center text-xs text-muted">
              Prefer to add a full delivery address now?{' '}
              <Link to="/order-request" onClick={onClose} className="font-semibold text-brand-600 hover:underline">
                Use the detailed form
              </Link>
            </p>
          </form>
        )}

        {step === STEP.ERROR && (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/15">
              <AlertTriangle className="h-7 w-7 text-danger" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold">Something went wrong</h3>
            <p className="mt-2 text-sm text-muted">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => setStep(STEP.DETAILS)} icon={RefreshCw}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {step === STEP.DONE && order && (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold">Order request received!</h3>
            <p className="mt-1 text-sm text-muted">Your order number is</p>
            <button type="button" onClick={copy} className="mt-3 inline-flex items-center gap-2 rounded-pill border px-5 py-2.5 font-ui text-xl font-bold tracking-wide text-ink" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass)' }} aria-label="Copy order number">
              {order.orderNumber}
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted" />}
            </button>

            <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm text-muted">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" /> We will send this number to <span className="font-medium text-ink">{order.customer?.email}</span>.
              </li>
              <li className="flex items-start gap-2">
                <PhoneCall className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" /> We call {order.customer?.phone} within a few hours to confirm your delivery address. You pay on delivery.
              </li>
            </ul>

            <div className="mt-6 grid gap-3">
              <a href={whatsappLink(buildWhatsAppMessage(order))} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg w-full">
                <WhatsAppIcon className="h-5 w-5" /> Send order to admin on WhatsApp
              </a>
              <Link to={`/order-confirmation/${order.trackingToken}`} state={{ order }} onClick={onClose} className="btn btn-secondary btn-md w-full">
                View order details <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={onClose} className="text-sm font-medium text-muted hover:text-ink">
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
