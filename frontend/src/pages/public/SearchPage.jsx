import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowUpDown, RefreshCw, Search, SearchX, X } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import ProductGrid from '@/components/product/ProductGrid';
import { SORT_OPTIONS } from '@/components/product/ProductFilters';
import { CategoryIcon } from '@/components/category/CategoryNav';
import { useFetch } from '@/hooks/useFetch';
import { useDebounce } from '@/hooks/useDebounce';
import { useCategories } from '@/hooks/useProducts';
import { productService } from '@/services/productService';

const LIMIT = 12;
const SUGGESTIONS = ['vitamin', 'fertilizer', 'baby', 'thermometer', 'moringa'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim();
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  const [term, setTerm] = useState(q);
  const debounced = useDebounce(term.trim(), 400);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const update = (partial, { resetPage = true, replace = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(partial).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) next.delete(k);
      else next.set(k, String(v));
    });
    if (resetPage) next.delete('page');
    setSearchParams(next, { replace });
  };

  /* Typing updates the URL after a short pause (replace, so history stays clean). */
  useEffect(() => {
    if (debounced !== q) update({ q: debounced }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  /* Keep the input in sync when the query changes from outside (e.g. header search). */
  useEffect(() => {
    if (q !== debounced) setTerm(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const params = useMemo(() => ({ q, sort, page, limit: LIMIT }), [q, sort, page]);
  const { data: products, meta, loading, error, refetch } = useFetch(() => productService.list(params), [JSON.stringify(params)], { enabled: !!q, initialData: [] });
  const { data: categories } = useCategories();

  const onSubmit = (e) => {
    e.preventDefault();
    update({ q: term.trim() });
  };

  const clear = () => {
    setTerm('');
    update({ q: '' });
    inputRef.current?.focus();
  };

  const onPageChange = (p) => {
    update({ page: p > 1 ? p : '' }, { resetPage: false });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const total = meta?.total ?? 0;
  const hasResults = !loading && !error && products?.length > 0;
  const noResults = !!q && !loading && !error && products?.length === 0;

  const popularCategories = (
    <div className="flex flex-wrap justify-center gap-2">
      {(categories || []).slice(0, 6).map((c) => (
        <Link key={c.slug} to={`/category/${c.slug}`} className="btn btn-secondary btn-sm">
          <CategoryIcon name={c.icon} className="h-4 w-4" /> {c.name}
        </Link>
      ))}
    </div>
  );

  return (
    <div>
      <SEOHead title={q ? `Search: ${q}` : 'Search'} description="Search Di-Grow for supplements, personal care, medicines, farm inputs and more. Delivered in Kigali, pay on delivery." noIndex={!!q} />

      <PageHero eyebrow="Find products" title="Search" highlight="the Store" subtitle="Type a product name, brand, category or ingredient. Results update as you type.">
        <form onSubmit={onSubmit} role="search" className="relative max-w-2xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search for vitamins, fertilizer, baby care…"
            aria-label="Search products"
            autoFocus
            className="input !rounded-pill !py-4 !pr-32 text-base shadow-float"
            style={{ paddingLeft: '3.25rem' }}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {term && (
              <button type="button" onClick={clear} className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-ink" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm !py-2.5">
              Search
            </button>
          </div>
        </form>
      </PageHero>

      <section ref={resultsRef} className="container scroll-mt-28 py-10 md:py-14">
        {!q ? (
          <EmptyState
            icon={Search}
            title="What are you looking for?"
            description="Start typing above, or try one of these popular searches and categories."
            action={
              <div className="space-y-5">
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => setTerm(s)} className="rounded-pill border border-line bg-surface px-3 py-1.5 text-sm text-muted transition hover:border-brand-500 hover:text-brand-500">
                      {s}
                    </button>
                  ))}
                </div>
                {popularCategories}
              </div>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-line bg-surface/60 px-4 py-3">
              <p className="text-sm text-muted" aria-live="polite">
                {loading ? (
                  <>Searching for “{q}”…</>
                ) : (
                  <>
                    Results for <span className="font-semibold text-ink">“{q}”</span>
                    {!error && (
                      <>
                        {' '}
                        · <span className="font-semibold text-ink">{total}</span> {total === 1 ? 'product' : 'products'}
                      </>
                    )}
                  </>
                )}
              </p>
              <label className="flex items-center gap-2 text-sm text-muted">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Sort by</span>
                <select value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })} className="input !w-auto !py-2 pr-8 text-sm" aria-label="Sort results">
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
                  title="Search is unavailable right now"
                  description={error.message}
                  action={
                    <button type="button" onClick={refetch} className="btn btn-primary btn-md">
                      <RefreshCw className="h-4 w-4" /> Try again
                    </button>
                  }
                />
              ) : noResults ? (
                <EmptyState
                  icon={SearchX}
                  title={`No results for “${q}”`}
                  description="Check the spelling or try a shorter word. You can also browse one of our popular categories."
                  action={
                    <div className="space-y-4">
                      {popularCategories}
                      <Link to="/shop" className="btn btn-primary btn-md">
                        Browse all products
                      </Link>
                    </div>
                  }
                />
              ) : (
                <ProductGrid products={products || []} loading={loading} skeletons={8} columns={4} />
              )}
            </div>

            {hasResults && <Pagination page={meta?.page || page} totalPages={meta?.totalPages || 1} total={total} limit={LIMIT} onChange={onPageChange} className="mt-10" />}
          </>
        )}
      </section>
    </div>
  );
}
