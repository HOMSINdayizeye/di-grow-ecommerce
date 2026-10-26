import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileCheck2, ShoppingBag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import { ConfirmModal } from '@/components/common/Modal';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { useCart } from '@/hooks/useCart';

export default function CartPage() {
  const { items, count, isEmpty, hasPrescriptionItems, clearCart } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  const onClear = () => {
    clearCart();
    setConfirmClear(false);
    toast.success('Cart cleared');
  };

  return (
    <div>
      <SEOHead title="Your cart" noIndex />

      <PageHero
        eyebrow="Step 1 of 3"
        title="Your"
        highlight="Cart"
        subtitle={isEmpty ? undefined : `${count} ${count === 1 ? 'item' : 'items'} ready to request. No payment online, we confirm by phone and you pay on delivery.`}
        breadcrumbs={[{ label: 'Cart' }]}
      />

      <section className="container py-10 md:py-14">
        {isEmpty ? (
          <div className="card mx-auto max-w-xl">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Browse the shop and add products. No account or online payment is needed to send an order request."
              action={
                <Button to="/shop" size="lg" iconRight={ArrowRight}>
                  Start shopping
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8">
              {hasPrescriptionItems && (
                <div className="mb-6 flex items-start gap-3 rounded-xl2 border border-accent-500/30 bg-accent-500/10 p-4 text-sm">
                  <FileCheck2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-500" />
                  <div>
                    <p className="font-semibold text-accent-500">Your cart includes prescription items</p>
                    <p className="mt-1 text-muted">Have your prescription ready. When we call to confirm, send a clear photo on WhatsApp and our pharmacist will verify it before dispatch.</p>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <h2 className="font-display text-xl font-bold">
                    Items <span className="text-sm font-normal text-muted">({count})</span>
                  </h2>
                  <button type="button" onClick={() => setConfirmClear(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-danger">
                    <Trash2 className="h-4 w-4" /> Clear cart
                  </button>
                </div>
                <div className="divide-y divide-line px-5">
                  {items.map((item) => (
                    <CartItem key={item.productId} item={item} />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Link to="/shop" className="btn btn-ghost btn-md text-brand-500">
                  <ArrowLeft className="h-4 w-4" /> Continue shopping
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <CartSummary>
                <Button to="/order-request" size="lg" className="w-full" iconRight={ArrowRight}>
                  Request order
                </Button>
                <p className="mt-3 text-center text-xs text-muted">Next: your name, phone and delivery address.</p>
              </CartSummary>
            </div>
          </div>
        )}
      </section>

      <ConfirmModal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={onClear}
        title="Clear your cart?"
        message="All items will be removed from your cart. You can add them again from the shop."
        confirmLabel="Clear cart"
        danger
      />
    </div>
  );
}
