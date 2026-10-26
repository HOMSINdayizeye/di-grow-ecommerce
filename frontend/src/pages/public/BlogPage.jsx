import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { Search, X, AlertCircle } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import PostList from '@/components/blog/PostList';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import { useFetch } from '@/hooks/useFetch';
import { useDebounce } from '@/hooks/useDebounce';
import { blogService } from '@/services/blogService';

const CATEGORIES = ['All', 'Wellness', 'Farming', 'Pharmacy', 'Mother & Baby'];
const LIMIT = 9;

export default function BlogPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const urlQ = params.get('q') || '';

  const [search, setSearch] = useState(urlQ);
  const q = useDebounce(search.trim(), 400);

  // Keep the URL in sync with the debounced search text (reset page on change).
  useEffect(() => {
    if (q === urlQ) return;
    const next = new URLSearchParams(params);
    if (q) next.set('q', q);
    else next.delete('q');
    next.delete('page');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // If the URL changes from outside (back button), reflect it in the input.
  useEffect(() => {
    setSearch((s) => (s.trim() === urlQ ? s : urlQ));
  }, [urlQ]);

  const { data: posts, meta, loading, error, refetch } = useFetch(
    () => blogService.list({ q: urlQ || undefined, category: category || undefined, page, limit: LIMIT }),
    [urlQ, category, page],
    { initialData: [] }
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const selectCategory = (c) => update({ category: c === 'All' ? '' : c, page: '' });
  const changePage = (p) => {
    update({ page: p > 1 ? String(p) : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const noFilters = !urlQ && !category;
  const featuredFirst = noFilters && page === 1;

  return (
    <div>
      <SEOHead title="Blog" description="Practical health, pharmacy and farming advice from the Di-Grow team in Kigali: wellness tips, crop nutrition guides, prescription know-how and mother & baby care." />

      <PageHero
        eyebrow="From our team"
        title="Health & Farming"
        highlight="Insights"
        subtitle="Plain-language advice from our pharmacist, agronomist and care team. New articles every week."
        breadcrumbs={[{ label: 'Blog' }]}
      >
        <label className="relative block max-w-xl">
          <span className="sr-only">Search articles</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, e.g. immunity, fertilizer…"
            className="input !rounded-pill !py-3.5 !pl-12 !pr-12 text-ink"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </PageHero>

      <section className="container section">
        {/* Category pills */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((c) => {
            const active = c === 'All' ? !category : category === c;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectCategory(c)}
                className={clsx(
                  'rounded-pill border px-4 py-2 font-ui text-sm font-semibold transition-all duration-300',
                  active ? 'border-transparent bg-gradient-brand text-white shadow-glow' : 'border-line bg-surface text-muted hover:text-ink hover:bg-surface-2'
                )}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Result summary */}
        {!loading && !error && (urlQ || category) && (
          <p className="mt-6 text-sm text-muted">
            {meta?.total ?? posts.length} article{(meta?.total ?? posts.length) === 1 ? '' : 's'}
            {category && <> in <span className="font-semibold text-ink">{category}</span></>}
            {urlQ && <> matching “<span className="font-semibold text-ink">{urlQ}</span>”</>}
          </p>
        )}

        <div className="mt-8">
          {error ? (
            <EmptyState
              icon={AlertCircle}
              title="Could not load articles"
              description={error.message}
              action={
                <button type="button" onClick={refetch} className="btn btn-primary btn-md">
                  Try again
                </button>
              }
            />
          ) : (
            <PostList posts={posts} loading={loading} featuredFirst={featuredFirst && posts.length > 1} />
          )}
        </div>

        {!loading && !error && meta?.totalPages > 1 && (
          <Pagination className="mt-12" page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onChange={changePage} />
        )}
      </section>
    </div>
  );
}
