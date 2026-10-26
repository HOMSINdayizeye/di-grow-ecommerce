import { useMemo, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowUpDown, FileCheck2, RefreshCw, SearchX } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters, { SORT_OPTIONS } from '@/components/product/ProductFilters';
import CategoryNav from '@/components/category/CategoryNav';
import { useFetch } from '@/hooks/useFetch';
import { useCategories, useProducts } from '@/hooks/useProducts';
import { categoryService } from '@/services/categoryService';

const LIMIT = 12;
const FILTER_KEYS = ['minPrice', 'maxPrice', 'inStock', 'prescription'];
const RX_SLUG = 'prescription-medicines';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsRef = useRef(null);

  const { data: categoryData, loading: catLoading, error: catError } = useFetch(() => categoryService.getBySlug(slug), [slug], { enabled: !!slug });
  const category = categoryData?.slug === slug ? categoryData : null;
  const { data: categories } = useCategories();

  const filters = useMemo(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, searchParams.get(k) || ''])), [searchParams]);
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const params = useMemo(() => ({ ...filters, category: slug, sort, page, limit: LIMIT }), [filters, slug, sort, page]);

  const { data: products, meta, loading, error, refetch } = useProducts(params);

  const update = (partial, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(partial).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || v === false) next.delete(k);
      else next.set(k, String(v));
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const resetFilters = () => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, ''])));

  const onPageChange = (p) => {
    update({ page: p > 1 ? p : '' }, { resetPage: false });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (catError) {
    return (
      <div className="container section">
        <SEOHead title="Category not found" noIndex />
        <EmptyState
          icon={SearchX}
          title={catError.status === 404 ? 'Category not found' : "We couldn't load this category"}
          description={catError.status === 404 ? 'This category may have been renamed or removed. Browse the full shop instead.' : catError.message}
          action={
            <Link to="/shop" className="btn btn-primary btn-md">
              Browse all products
            </Link>
          }
        />
      </div>
    );
  }

  if (!category || catLoading) {
    return (
      <div>
        <SEOHead title="Loading…" />
        <Loader full label="Loading category…" />
      </div>
    );
  }

  const total = meta?.total ?? 0;
  const hasResults = !loading && !error && products?.length > 0;
  const isRx = slug === RX_SLUG;

  return (
    <div>
      <SEOHead title={category.name} description={category.description} image={category.image} />

      <PageHero
        eyebrow="Category"
        title={category.name}
        subtitle={category.description}
        breadcrumbs={[
          { label: 'Shop', to: '/shop' },
          { label: category.name },
        ]}
      />

      <section className="container py-10 md:py-14">
        <CategoryNav variant="pills" categories={categories || []} active={slug} className="mb-6" />

        {isRx && (
          <div className="mb-8 flex items-start gap-4 rounded-xl2 border border-accent-500/30 bg-accent-500/10 p-5">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-500">
              <FileCheck2 className="h-5 w-5" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-accent-500">Prescription medicines are verified by our pharmacist</p>
              <p className="mt-1 leading-relaxed text-muted">
                You can request any item here without an account. When we call to confirm, send a clear photo of your valid prescription on WhatsApp. Our licensed pharmacist checks the dosage and interactions before anything is dispatched. Medicines cannot be returned once delivered.
              </p>
            </div>
          </div>
        )}

        <div ref={resultsRef} className="scroll-mt-28 gap-8 lg:grid lg:grid-cols-12">
          <div className="mb-4 lg:col-span-3 lg:mb-0">
            <ProductFilters hideCategories filters={{ ...filters, category: '' }} onChange={update} onReset={resetFilters} />
          </div>

          <div className="min-w-0 lg:col-span-9">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-line bg-surface/60 px-4 py-3">
              <p className="text-sm text-muted" aria-live="polite">
                {loading ? (
                  'Loading products…'
                ) : (
                  <>
                    <span className="font-semibold text-ink">{total}</span> {total === 1 ? 'product' : 'products'} in <span className="font-semibold text-ink">{category.name}</span>
                  </>
                )}
              </p>
              <label className="flex items-center gap-2 text-sm text-muted">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}
                  className="input !w-auto !py-2 pr-8 text-sm"
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6">
              {error ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="We couldn't load products"
                  description={error.message}
                  action={
                    <button type="button" onClick={refetch} className="btn btn-primary btn-md">
                      <RefreshCw className="h-4 w-4" /> Try again
                    </button>
                  }
                />
              ) : (
                <ProductGrid
                  products={products || []}
                  loading={loading}
                  skeletons={LIMIT}
                  columns={4}
                  emptyTitle={`No products in ${category.name} yet`}
                  emptyDescription="Try clearing the filters, or browse the full shop."
                  emptyAction={
                    <div className="flex flex-wrap justify-center gap-3">
                      <button type="button" onClick={resetFilters} className="btn btn-secondary btn-md">
                        Clear filters
                      </button>
                      <Link to="/shop" className="btn btn-primary btn-md">
                        Browse all products
                      </Link>
                    </div>
                  }
                />
              )}
            </div>

            {hasResults && <Pagination page={meta?.page || page} totalPages={meta?.totalPages || 1} total={total} limit={LIMIT} onChange={onPageChange} className="mt-10" />}
          </div>
        </div>
      </section>
    </div>
  );
}
