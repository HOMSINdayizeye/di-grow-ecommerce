import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { ShoppingBag, ChevronUp, X, Minus, Plus, Trash2, ArrowRight, Check } from 'lucide-react';
import QuickOrderModal from './QuickOrderModal';
import PrescriptionBadge from '@/components/product/PrescriptionBadge';
import { useCart } from '@/hooks/useCart';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency } from '@/utils/formatCurrency';

/**
 * Compact cart docked in the lower-left corner.
 *  - Collapsed: item count + total. Briefly shows the last added product.
 *  - Expanded: table of items with quantity controls and remove buttons,
 *    totals, and an "Order now" button that opens the quick order flow.
 */
export default function MiniCart() {
  const { items, count, subtotal, isOpen, closeCart, toggleCart, lastAdded, updateQuantity, removeItem, clearCart } = useCart();
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const [peek, setPeek] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  // Show the "added" preview for a few seconds after each add.
  useEffect(() => {
    if (!lastAdded) return undefined;
    setPeek(true);
    const t = setTimeout(() => setPeek(false), 3500);
    return () => clearTimeout(t);
  }, [lastAdded]);

  // Collapse when navigating to another page or when the cart empties.
  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);
  useEffect(() => {
    if (items.length === 0) closeCart();
  }, [items.length, closeCart]);

  const hidden = pathname.startsWith('/admin') || pathname === '/order-request' || pathname.startsWith('/order-confirmation');
  if (hidden || (items.length === 0 && !quickOpen)) return null;

  const freeAt = Number(settings.freeDeliveryThreshold) || 0;
  const deliveryFee = freeAt && subtotal >= freeAt ? 0 : Number(settings.deliveryFee) || 0;

  return (
    <>
      {items.length > 0 && (
        <div className={clsx('fixed z-40', isOpen ? 'inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-4 sm:left-4' : 'bottom-4 left-4 right-24 sm:right-auto')}>
          {/* Added-to-cart preview */}
          {!isOpen && peek && lastAdded && (
            <div className="card mb-2 flex items-center gap-3 p-3 pr-4 shadow-float animate-fade-up">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
                <Check className="h-4 w-4" />
              </span>
              {lastAdded.image && <img src={lastAdded.image} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-brand-600">Added to cart</p>
                <p className="truncate text-sm font-medium text-ink">
                  {lastAdded.quantity > 1 && <span className="text-muted">{lastAdded.quantity} × </span>}
                  {lastAdded.name}
                </p>
              </div>
            </div>
          )}

          {!isOpen ? (
            <button
              type="button"
              onClick={toggleCart}
              className="glass flex w-full items-center gap-3 rounded-pill py-2 pl-2 pr-4 shadow-float transition hover:shadow-glow sm:w-auto"
              aria-expanded={false}
              aria-label={`Open cart, ${count} items, ${formatCurrency(subtotal)}`}
            >
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-white">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-accent-500 px-1 text-[11px] font-bold text-white">{count > 99 ? '99+' : count}</span>
              </span>
              <span className="flex-1 text-left">
                <span className="block text-xs text-muted">
                  {count} item{count === 1 ? '' : 's'} in cart
                </span>
                <span className="block font-ui text-base font-bold leading-tight text-ink">{formatCurrency(subtotal)}</span>
              </span>
              <ChevronUp className="h-4 w-4 text-muted" />
            </button>
          ) : (
            <div className="card flex max-h-[85vh] w-full flex-col overflow-hidden rounded-b-none shadow-float animate-fade-up sm:w-[26rem] sm:rounded-b-xl2" role="dialog" aria-label="Your cart">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                  <ShoppingBag className="h-5 w-5 text-brand-500" /> Your cart <span className="text-sm font-normal text-muted">({count})</span>
                </h3>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={clearCart} className="rounded-pill px-2.5 py-1 text-xs text-muted transition hover:bg-danger/10 hover:text-danger">
                    Clear
                  </button>
                  <button type="button" onClick={closeCart} className="rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink" aria-label="Close cart">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface text-left text-[11px] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Item</th>
                      <th className="px-2 py-2 text-center font-semibold">Qty</th>
                      <th className="px-2 py-2 text-right font-semibold">Total</th>
                      <th className="w-10 px-2 py-2" aria-label="Remove" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {items.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <img src={item.image} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg bg-surface-2 object-cover" />
                            <div className="min-w-0">
                              <Link to={`/product/${item.slug}`} className="line-clamp-1 font-medium text-ink hover:text-brand-600">
                                {item.name}
                              </Link>
                              <p className="text-xs text-muted">
                                {formatCurrency(item.price)} each {item.requiresPrescription && <PrescriptionBadge className="ml-1 !px-1.5 !py-0" />}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5">
                          <div className="mx-auto flex w-fit items-center rounded-pill border border-line">
                            <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 text-muted hover:text-ink" aria-label="Decrease quantity">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-6 text-center text-xs font-semibold">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 text-muted hover:text-ink" aria-label="Increase quantity">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right font-ui font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                        <td className="px-2 py-2.5 text-right">
                          <button type="button" onClick={() => removeItem(item.productId)} className="rounded-full p-1.5 text-muted transition hover:bg-danger/10 hover:text-danger" aria-label={`Remove ${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-line bg-surface-2/60 p-4">
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted">
                    <dt>Subtotal</dt>
                    <dd>{formatCurrency(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-muted">
                    <dt>Delivery (Kigali)</dt>
                    <dd className={clsx(deliveryFee === 0 && 'text-success')}>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</dd>
                  </div>
                  <div className="flex justify-between pt-1 text-base font-semibold text-ink">
                    <dt>Total</dt>
                    <dd className="font-ui text-xl font-bold">{formatCurrency(subtotal + deliveryFee)}</dd>
                  </div>
                </dl>
                <button type="button" onClick={() => setQuickOpen(true)} className="btn btn-primary btn-lg mt-3 w-full">
                  Order now <ArrowRight className="h-5 w-5" />
                </button>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <Link to="/cart" onClick={closeCart} className="font-medium text-brand-600 hover:underline">
                    Open full cart
                  </Link>
                  <Link to="/order-request" onClick={closeCart} className="font-medium text-muted hover:text-ink">
                    Add delivery address
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <QuickOrderModal open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  );
}
