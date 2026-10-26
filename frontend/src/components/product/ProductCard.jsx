import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ShoppingBag, Star, Check, Minus, Plus } from 'lucide-react';
import PrescriptionBadge from './PrescriptionBadge';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatCurrency';

export default function ProductCard({ product, className }) {
  const { addItem, getQuantity, updateQuantity } = useCart();
  const qty = getQuantity(product._id);
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  return (
    <article className={clsx('card card-hover group relative flex flex-col overflow-hidden', className)}>
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-surface-2">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && <span className="badge bg-gradient-gold text-navy-900">-{discount}%</span>}
          {product.requiresPrescription && <PrescriptionBadge />}
          {!product.inStock && <span className="badge bg-navy-900/80 text-white">Out of stock</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-500">{product.category?.name}</p>
        <h3 className="mt-1 line-clamp-2 font-sans text-sm font-semibold leading-snug text-ink">
          <Link to={`/product/${product.slug}`} className="hover:text-brand-500">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
          <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
          <span className="font-medium text-ink">{product.rating?.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="font-ui text-base font-bold text-ink">{formatCurrency(product.price)}</p>
            {product.compareAtPrice && <p className="text-xs text-muted line-through">{formatCurrency(product.compareAtPrice)}</p>}
          </div>
          {qty > 0 ? (
            <div className="flex items-center rounded-pill border border-brand-500/40 bg-brand-500/10">
              <button type="button" onClick={() => updateQuantity(product._id, qty - 1)} className="p-2 text-brand-500 hover:text-accent-500" aria-label="Decrease quantity">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-6 text-center text-sm font-bold text-ink">{qty}</span>
              <button type="button" onClick={() => updateQuantity(product._id, qty + 1)} className="p-2 text-brand-500 hover:text-accent-500" aria-label="Increase quantity">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addItem(product)}
              disabled={!product.inStock}
              className="btn btn-primary btn-sm !px-3.5"
              aria-label={`Add ${product.name} to cart`}
            >
              {product.inStock ? <ShoppingBag className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              <span className="hidden sm:inline">{product.inStock ? 'Add' : 'Notify'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
