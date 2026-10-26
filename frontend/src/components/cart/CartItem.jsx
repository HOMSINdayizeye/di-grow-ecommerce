import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import PrescriptionBadge from '@/components/product/PrescriptionBadge';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatCurrency';

export default function CartItem({ item, compact = false, onNavigate }) {
  const { updateQuantity, removeItem } = useCart();
  return (
    <div className="flex gap-3 py-4">
      <Link to={`/product/${item.slug}`} onClick={onNavigate} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-2">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/product/${item.slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand-500">
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted">{item.category}</p>
            {item.requiresPrescription && <PrescriptionBadge className="mt-1" />}
          </div>
          <button type="button" onClick={() => removeItem(item.productId)} className="rounded-full p-1.5 text-muted transition hover:bg-danger/15 hover:text-danger" aria-label={`Remove ${item.name}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center rounded-pill border border-line">
            <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 text-muted hover:text-ink" aria-label="Decrease quantity">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-7 text-center text-sm font-semibold">{item.quantity}</span>
            <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 text-muted hover:text-ink" aria-label="Increase quantity">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-right">
            <p className="font-ui text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
            {!compact && item.quantity > 1 && <p className="text-xs text-muted">{formatCurrency(item.price)} each</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
