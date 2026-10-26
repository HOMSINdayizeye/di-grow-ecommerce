import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ShoppingBag, X, ArrowRight } from 'lucide-react';
import CartItem from './CartItem';
import EmptyState from '@/components/common/EmptyState';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatCurrency';

export default function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, count, clearCart } = useCart();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  return (
    <div className={clsx('fixed inset-0 z-[80]', isOpen ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!isOpen}>
      <div className={clsx('absolute inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity duration-300', isOpen ? 'opacity-100' : 'opacity-0')} onClick={closeCart} />
      <aside
        className={clsx('absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-float transition-transform duration-300', isOpen ? 'translate-x-0' : 'translate-x-full')}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <ShoppingBag className="h-5 w-5 text-brand-500" /> Your cart <span className="text-sm font-normal text-muted">({count})</span>
          </h2>
          <button type="button" onClick={closeCart} className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-ink" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 scrollbar-thin">
          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Browse the shop and add products. No payment is needed online."
              action={
                <Link to="/shop" onClick={closeCart} className="btn btn-primary btn-md">
                  Start shopping
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-line">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} compact onNavigate={closeCart} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-line p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-ui text-lg font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-xs text-muted">Delivery is calculated at the next step. We call you to confirm before dispatch.</p>
            <Link to="/order-request" onClick={closeCart} className="btn btn-primary btn-lg w-full">
              Request order <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex items-center justify-between">
              <Link to="/cart" onClick={closeCart} className="text-sm font-medium text-brand-500 hover:underline">
                View full cart
              </Link>
              <button type="button" onClick={clearCart} className="text-sm text-muted hover:text-danger">
                Clear cart
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
