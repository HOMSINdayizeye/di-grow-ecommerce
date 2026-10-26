import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Star, Truck, ShieldCheck, PhoneCall, Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import PrescriptionBadge from './PrescriptionBadge';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatCurrency';
import { whatsappLink } from '@/constants/site';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';

export default function ProductInfo({ product }) {
  const [qty, setQty] = useState(1);
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product._id);
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  const add = () => addItem(product, qty);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Link to={`/category/${product.category?.slug}`} className="text-xs font-semibold uppercase tracking-wider text-brand-500 hover:underline">
          {product.category?.name}
        </Link>
        {product.brand && <span className="text-xs text-muted">· {product.brand}</span>}
        {product.requiresPrescription && <PrescriptionBadge size="md" />}
      </div>

      <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">{product.name}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating || 0) ? 'fill-gold-500 text-gold-500' : 'text-muted/40'}`} />
          ))}
          <span className="ml-1 font-medium">{product.rating?.toFixed(1)}</span>
          <span className="text-muted">({product.reviewCount} reviews)</span>
        </span>
        <span className="text-muted">SKU: {product.sku}</span>
        <span className={`badge ${product.inStock ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>{product.inStock ? 'In stock' : 'Out of stock'}</span>
      </div>

      <p className="mt-5 text-base leading-relaxed text-muted">{product.shortDescription}</p>

      <div className="mt-6 flex items-end gap-3">
        <span className="font-ui text-3xl font-bold text-ink">{formatCurrency(product.price)}</span>
        {product.compareAtPrice && (
          <>
            <span className="pb-1 text-lg text-muted line-through">{formatCurrency(product.compareAtPrice)}</span>
            <span className="badge mb-1.5 bg-gradient-gold text-navy-900">Save {discount}%</span>
          </>
        )}
      </div>

      {product.requiresPrescription && (
        <div className="mt-5 rounded-xl border border-accent-500/30 bg-accent-500/10 p-4 text-sm">
          <p className="font-semibold text-accent-500">This product needs a prescription.</p>
          <p className="mt-1 text-muted">You can still request it now. When we call to confirm, send a clear photo of your prescription on WhatsApp and our pharmacist will verify it before dispatch.</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-pill border border-line bg-surface">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-muted hover:text-ink" aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <input type="number" min="1" max="50" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="w-12 bg-transparent text-center font-semibold text-ink outline-none" aria-label="Quantity" />
          <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))} className="p-3 text-muted hover:text-ink" aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={add} disabled={!product.inStock} className="btn btn-primary btn-lg flex-1 sm:flex-none">
          {inCart ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
          {product.inStock ? (inCart ? 'Add more to cart' : 'Add to cart') : 'Unavailable'}
        </button>
        <a href={whatsappLink(`Hello, I am interested in ${product.name} (${product.sku}).`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
          <WhatsAppIcon className="h-5 w-5" /> Ask on WhatsApp
        </a>
        <button type="button" onClick={share} className="rounded-full border border-line p-3 text-muted transition hover:text-ink" aria-label="Share product">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
        <li className="flex items-start gap-2 rounded-xl bg-surface-2 p-3">
          <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
          <span className="text-muted">Same-day delivery in Kigali on confirmed orders</span>
        </li>
        <li className="flex items-start gap-2 rounded-xl bg-surface-2 p-3">
          <PhoneCall className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
          <span className="text-muted">No online payment. We call to confirm, you pay on delivery</span>
        </li>
        <li className="flex items-start gap-2 rounded-xl bg-surface-2 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
          <span className="text-muted">Genuine products from licensed suppliers</span>
        </li>
      </ul>
    </div>
  );
}
