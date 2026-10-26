import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Package, Pencil, Trash2, Star } from 'lucide-react';
import PrescriptionBadge from '@/components/product/PrescriptionBadge';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import { TableSkeleton } from '@/components/common/Loader';
import { formatCurrency } from '@/utils/formatCurrency';

function StockBadge({ qty }) {
  const n = Number(qty) || 0;
  const cls = n === 0 ? 'bg-danger/15 text-danger border-danger/30' : n <= 5 ? 'bg-gold-500/15 text-gold-500 border-gold-500/30' : 'bg-success/15 text-success border-success/30';
  const label = n === 0 ? 'Out' : n <= 5 ? `Low · ${n}` : `In stock · ${n}`;
  return <span className={clsx('badge border', cls)}>{label}</span>;
}

function Flags({ product }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {product.requiresPrescription && <PrescriptionBadge />}
      {product.isFeatured && (
        <span className="badge border border-gold-500/30 bg-gold-500/15 text-gold-500">
          <Star className="h-3 w-3" /> Featured
        </span>
      )}
      {!product.requiresPrescription && !product.isFeatured && <span className="text-xs text-muted">—</span>}
    </span>
  );
}

function Thumb({ product }) {
  const src = product.images?.[0];
  return src ? (
    <img src={src} alt="" className="h-11 w-11 flex-shrink-0 rounded-lg border border-line object-cover" loading="lazy" />
  ) : (
    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
      <Package className="h-5 w-5" />
    </span>
  );
}

/**
 * <ProductsTable products={items} loading={loading} onDelete={(product) => ...} />
 */
export default function ProductsTable({ products = [], loading = false, onDelete }) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }
  if (!products.length) {
    return (
      <div className="card">
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try a different search or add your first product."
          compact
          action={
            <Button to="/admin/products/new" size="sm">
              Add product
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="hidden overflow-x-auto scrollbar-thin md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-2/60 font-ui text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold text-right">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Flags</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/10">
            {products.map((p) => (
              <tr key={p._id} className="transition hover:bg-surface-2/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb product={p} />
                    <div className="min-w-0">
                      <Link to={`/admin/products/${p._id}/edit`} className="block truncate font-medium text-ink hover:text-brand-500">
                        {p.name}
                      </Link>
                      <p className="font-mono text-xs text-muted">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.category?.name || '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <p className="font-semibold text-ink">{formatCurrency(p.price)}</p>
                  {p.compareAtPrice > p.price && <p className="text-xs text-muted line-through">{formatCurrency(p.compareAtPrice)}</p>}
                </td>
                <td className="px-4 py-3">
                  <StockBadge qty={p.stockQty} />
                </td>
                <td className="px-4 py-3">
                  <Flags product={p} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/admin/products/${p._id}/edit`} className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-brand-500" aria-label={`Edit ${p.name}`} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button type="button" onClick={() => onDelete?.(p)} className="rounded-full p-2 text-muted transition hover:bg-danger/15 hover:text-danger" aria-label={`Delete ${p.name}`} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line/10 md:hidden">
        {products.map((p) => (
          <li key={p._id} className="flex gap-3 p-4">
            <Thumb product={p} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.name}</p>
                  <p className="font-mono text-xs text-muted">
                    {p.sku} · {p.category?.name}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  <Link to={`/admin/products/${p._id}/edit`} className="rounded-full p-2 text-muted hover:text-brand-500" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button type="button" onClick={() => onDelete?.(p)} className="rounded-full p-2 text-muted hover:text-danger" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{formatCurrency(p.price)}</span>
                {p.compareAtPrice > p.price && <span className="text-xs text-muted line-through">{formatCurrency(p.compareAtPrice)}</span>}
                <StockBadge qty={p.stockQty} />
                <Flags product={p} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
