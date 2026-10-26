import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function range(page, total) {
  const pages = new Set([1, total, page, page - 1, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export default function Pagination({ page = 1, totalPages = 1, onChange, className, total, limit }) {
  if (!totalPages || totalPages <= 1) {
    return total ? <p className={clsx('text-sm text-muted', className)}>{total} result{total === 1 ? '' : 's'}</p> : null;
  }
  const pages = range(page, totalPages);
  const btn = 'inline-flex h-10 min-w-10 items-center justify-center rounded-pill px-3 text-sm font-medium transition';

  return (
    <nav className={clsx('flex flex-wrap items-center justify-between gap-4', className)} aria-label="Pagination">
      {total ? (
        <p className="text-sm text-muted">
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <button type="button" className={clsx(btn, 'text-muted hover:bg-surface-2 disabled:opacity-40')} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-muted">…</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={clsx(btn, p === page ? 'bg-gradient-brand text-white shadow-glow' : 'text-muted hover:bg-surface-2')}
            >
              {p}
            </button>
          </span>
        ))}
        <button type="button" className={clsx(btn, 'text-muted hover:bg-surface-2 disabled:opacity-40')} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
