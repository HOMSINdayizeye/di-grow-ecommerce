import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, X } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import ProductsTable from '@/components/admin/ProductsTable';
import ErrorState from '@/components/admin/ErrorState';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/common/Button';
import { ConfirmModal } from '@/components/common/Modal';
import { useFetch } from '@/hooks/useFetch';
import { useDebounce } from '@/hooks/useDebounce';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { getErrorMessage } from '@/services/api';

const LIMIT = 10;
const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most reviewed' },
];
const STOCK = [
  { value: '', label: 'All stock' },
  { value: 'low', label: 'Low stock (≤5)' },
  { value: 'out', label: 'Out of stock' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const stock = searchParams.get('stock') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const q = useDebounce(search.trim(), 400);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const update = useCallback(
    (patch, { resetPage = true } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const urlQ = searchParams.get('q') || '';
  useEffect(() => {
    if (q !== urlQ) update({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const params = useMemo(() => ({ q: urlQ, category, stock, sort, page, limit: LIMIT }), [urlQ, category, stock, sort, page]);
  const key = JSON.stringify(params);
  const { data: products, meta, loading, error, refetch } = useFetch(() => productService.adminList(params), [key], { initialData: [] });
  const { data: categories } = useFetch(() => categoryService.adminList(), [], { initialData: [] });

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await productService.remove(toDelete._id);
      toast.success(`${toDelete.name} deleted`);
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = urlQ || category || stock || sort !== 'newest';

  return (
    <div>
      <SEOHead title="Products" noIndex />
      <PageHeader
        title="Product"
        highlight="catalogue"
        subtitle={meta?.total != null ? `${meta.total} product${meta.total === 1 ? '' : 's'} in the shop` : 'Manage stock, prices and prescription flags.'}
        actions={
          <Button to="/admin/products/new" size="sm" icon={Plus}>
            Add product
          </Button>
        }
      />

      <div className="card mb-4 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU" className="input py-2.5 pl-9 text-sm" aria-label="Search products" />
        </div>
        <select value={category} onChange={(e) => update({ category: e.target.value })} className="input py-2.5 text-sm" aria-label="Category">
          <option value="">All categories</option>
          {(categories || []).map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={stock} onChange={(e) => update({ stock: e.target.value })} className="input py-2.5 text-sm" aria-label="Stock">
          {STOCK.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })} className="input py-2.5 text-sm" aria-label="Sort">
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          disabled={!hasFilters}
          onClick={() => {
            setSearch('');
            setSearchParams({}, { replace: true });
          }}
        >
          Clear
        </Button>
      </div>

      {error ? (
        <div className="card">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : (
        <>
          <ProductsTable products={products || []} loading={loading && !(products || []).length} onDelete={setToDelete} />
          <Pagination className="mt-4" page={meta?.page || 1} totalPages={meta?.totalPages || 1} total={meta?.total} limit={meta?.limit || LIMIT} onChange={(p) => update({ page: String(p) }, { resetPage: false })} />
        </>
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete product?"
        message={toDelete ? `"${toDelete.name}" will be removed from the shop. Existing orders keep their item details.` : ''}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
