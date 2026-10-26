import clsx from 'clsx';

/** Spinner. Use `full` for a page-level centered loader. */
export default function Loader({ full = false, size = 'md', label = 'Loading…', className }) {
  const dims = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-4' }[size];
  const spinner = (
    <div className={clsx('inline-flex flex-col items-center gap-3', className)} role="status" aria-live="polite">
      <span className={clsx('animate-spin rounded-full border-brand-500/30 border-t-brand-500', dims)} />
      {label && <span className="text-sm text-muted">{label}</span>}
    </div>
  );
  if (full) {
    return <div className="flex min-h-[50vh] w-full items-center justify-center">{spinner}</div>;
  }
  return spinner;
}

/** Skeleton block used while lists load. */
export function Skeleton({ className }) {
  return <div className={clsx('skeleton', className)} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full rounded-pill" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}
