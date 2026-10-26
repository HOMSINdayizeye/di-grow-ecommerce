import clsx from 'clsx';
import { Truck, Info } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency } from '@/utils/formatCurrency';

/** Subtotal / delivery / total panel. `items` defaults to the cart. */
export default function CartSummary({ items, subtotal: subtotalProp, deliveryFee: feeProp, className, children, title = 'Order summary' }) {
  const cart = useCart();
  const { settings } = useSettings();
  const list = items || cart.items;
  const subtotal = subtotalProp ?? list.reduce((s, i) => s + i.price * i.quantity, 0);
  const freeAt = Number(settings.freeDeliveryThreshold) || 0;
  const deliveryFee = feeProp ?? (freeAt && subtotal >= freeAt ? 0 : Number(settings.deliveryFee) || 0);
  const remaining = freeAt && subtotal < freeAt ? freeAt - subtotal : 0;
  const progress = freeAt ? Math.min(100, Math.round((subtotal / freeAt) * 100)) : 0;
  const hasRx = list.some((i) => i.requiresPrescription);

  return (
    <div className={clsx('card p-5', className)}>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal ({list.reduce((s, i) => s + i.quantity, 0)} items)</dt>
          <dd className="font-medium">{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="flex items-center gap-1.5 text-muted">
            <Truck className="h-4 w-4" /> Delivery (Kigali)
          </dt>
          <dd className={clsx('font-medium', deliveryFee === 0 && 'text-success')}>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base">
          <dt className="font-semibold">Estimated total</dt>
          <dd className="font-ui text-xl font-bold text-ink">{formatCurrency(subtotal + deliveryFee)}</dd>
        </div>
      </dl>

      {freeAt > 0 && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-2">
            <div className="h-full rounded-pill bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {remaining > 0 ? <>Add {formatCurrency(remaining)} more for free delivery.</> : <span className="text-success">You qualify for free delivery.</span>}
          </p>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
        <span>No payment online. We call to confirm your request and you pay on delivery (cash or mobile money).{hasRx ? ' Prescription items are verified by our pharmacist first.' : ''}</span>
      </p>

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
