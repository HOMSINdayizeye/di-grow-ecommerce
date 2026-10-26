import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, ExternalLink, FileText, X } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import ErrorState from '@/components/admin/ErrorState';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { TableSkeleton } from '@/components/common/Loader';
import { ConfirmModal } from '@/components/common/Modal';
import { useFetch } from '@/hooks/useFetch';
import { useDebounce } from '@/hooks/useDebounce';
import { blogService } from '@/services/blogService';
import { getErrorMessage } from '@/services/api';
import { formatDate, formatDateTime } from '@/utils/formatDate';

const LIMIT = 10;
const STATUS = [
  { value: '', label: 'All posts' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
];

function StatusBadge({ published }) {
  return <span className={clsx('badge border', published ? 'border-success/30 bg-success/15 text-success' : 'border-gold-500/30 bg-gold-500/15 text-gold-500')}>{published ? 'Published' : 'Draft'}</span>;
}

function Actions({ post, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {post.isPublished && (
        <Link to={`/blog/${post.slug}`} target="_blank" className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-ink" aria-label="View on site" title="View on site">
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}
      <Link to={`/admin/blog/${post._id}/edit`} className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-brand-500" aria-label="Edit" title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <button type="button" onClick={() => onDelete(post)} className="rounded-full p-2 text-muted transition hover:bg-danger/15 hover:text-danger" aria-label="Delete" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
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

  const params = useMemo(() => ({ q: urlQ, status, page, limit: LIMIT }), [urlQ, status, page]);
  const key = JSON.stringify(params);
  const { data: posts, meta, loading, error, refetch } = useFetch(() => blogService.adminList(params), [key], { initialData: [] });

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await blogService.remove(toDelete._id);
      toast.success('Post deleted');
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const list = posts || [];
  const hasFilters = urlQ || status;

  return (
    <div>
      <SEOHead title="Blog" noIndex />
      <PageHeader
        title="Blog"
        highlight="posts"
        subtitle="Health tips, farming advice and pharmacy news for customers."
        actions={
          <Button to="/admin/blog/new" size="sm" icon={Plus}>
            New post
          </Button>
        }
      />

      <div className="card mb-4 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title" className="input py-2.5 pl-9 text-sm" aria-label="Search posts" />
        </div>
        <select value={status} onChange={(e) => update({ status: e.target.value })} className="input py-2.5 text-sm" aria-label="Status">
          {STATUS.map((s) => (
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
      ) : loading && !list.length ? (
        <div className="card overflow-hidden">
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title={hasFilters ? 'No posts match' : 'No posts yet'}
            description={hasFilters ? 'Try a different search or status.' : 'Write your first article to help customers.'}
            action={
              !hasFilters && (
                <Button to="/admin/blog/new" size="sm" icon={Plus}>
                  New post
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="hidden overflow-x-auto scrollbar-thin md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-surface-2/60 font-ui text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Post</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/10">
                  {list.map((p) => (
                    <tr key={p._id} className="transition hover:bg-surface-2/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.coverImage ? <img src={p.coverImage} alt="" className="h-11 w-16 flex-shrink-0 rounded-lg border border-line object-cover" loading="lazy" /> : <span className="flex h-11 w-16 items-center justify-center rounded-lg bg-surface-2 text-muted"><FileText className="h-4 w-4" /></span>}
                          <div className="min-w-0">
                            <Link to={`/admin/blog/${p._id}/edit`} className="block truncate font-medium text-ink hover:text-brand-500">
                              {p.title}
                            </Link>
                            <p className="truncate text-xs text-muted">
                              {p.author?.name} · {p.readTime} min read
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{p.category}</td>
                      <td className="px-4 py-3">
                        <StatusBadge published={p.isPublished} />
                      </td>
                      <td className="px-4 py-3 text-muted" title={formatDateTime(p.publishedAt || p.createdAt)}>
                        {formatDate(p.publishedAt || p.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Actions post={p} onDelete={setToDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line/10 md:hidden">
              {list.map((p) => (
                <li key={p._id} className="flex gap-3 p-4">
                  {p.coverImage ? <img src={p.coverImage} alt="" className="h-14 w-20 flex-shrink-0 rounded-lg border border-line object-cover" /> : <span className="flex h-14 w-20 items-center justify-center rounded-lg bg-surface-2 text-muted"><FileText className="h-4 w-4" /></span>}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-medium text-ink">{p.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <StatusBadge published={p.isPublished} />
                      <span>{p.category}</span>
                      <span>· {formatDate(p.publishedAt || p.createdAt)}</span>
                    </div>
                    <div className="mt-1 -mr-2">
                      <Actions post={p} onDelete={setToDelete} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Pagination className="mt-4" page={meta?.page || 1} totalPages={meta?.totalPages || 1} total={meta?.total} limit={meta?.limit || LIMIT} onChange={(p) => update({ page: String(p) }, { resetPage: false })} />
        </>
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete post?"
        message={toDelete ? `"${toDelete.title}" will be permanently removed.` : ''}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
