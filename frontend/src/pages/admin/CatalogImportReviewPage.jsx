import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, PackagePlus, ChevronDown, ChevronUp, Package, Pencil, EyeOff, Undo2, Search, AlertTriangle } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import ErrorState from '@/components/admin/ErrorState';
import ImageUploader from '@/components/admin/ImageUploader';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import { Switch } from '@/components/common/FormField';
import { Skeleton } from '@/components/common/Loader';
import { useFetch } from '@/hooks/useFetch';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { getErrorMessage } from '@/services/api';

const FILTERS = [
  { value: 'pending', label: 'To review' },
  { value: 'imported', label: 'Imported' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'all', label: 'All' },
];

/** Editable copy of a candidate: form-friendly values (strings for numbers, '' for null). */
const toRow = (it) => ({
  ...it,
  categoryId: it.category ? String(it.category) : '',
  price: it.price ?? '',
  compareAtPrice: it.compareAtPrice ?? '',
  stockQty: it.stockQty ?? 0,
  tags: Array.isArray(it.tags) ? it.tags.join(', ') : it.tags || '',
});

const toPayload = (r) => ({
  _id: r._id,
  name: r.name,
  sku: r.sku,
  brand: r.brand,
  categoryId: r.categoryId || '',
  price: r.price === '' ? null : r.price,
  compareAtPrice: r.compareAtPrice === '' ? null : r.compareAtPrice,
  stockQty: r.stockQty === '' ? 0 : r.stockQty,
  shortDescription: r.shortDescription,
  description: r.description,
  requiresPrescription: !!r.requiresPrescription,
  images: r.images || [],
  tags: r.tags,
  status: r.status === 'imported' ? undefined : r.status,
});

/** What still blocks a row from becoming a product. */
function rowProblems(r, defaultCategory) {
  const out = [];
  if (!r.name || r.name.trim().length < 3) out.push('name');
  if (!(Number(r.price) > 0)) out.push('price');
  if (!r.categoryId && !defaultCategory) out.push('category');
  return out;
}

function StatusBadge({ status }) {
  if (status === 'imported') return <span className="badge border border-success/30 bg-success/15 text-success">Imported</span>;
  if (status === 'skipped') return <span className="badge border border-line bg-surface-2 text-muted">Skipped</span>;
  return <span className="badge border border-gold-500/30 bg-gold-500/15 text-gold-500">Draft</span>;
}

export default function CatalogImportReviewPage() {
  const { id } = useParams();
  const { data: categories } = useFetch(() => categoryService.adminList(), [], { initialData: [] });
  const { data: doc, loading, error, refetch, setData } = useFetch(() => productService.getImport(id), [id]);

  const [rows, setRows] = useState([]);
  const [dirty, setDirty] = useState({});
  const [selected, setSelected] = useState({});
  const [expanded, setExpanded] = useState({});
  const [failures, setFailures] = useState({});
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultStock, setDefaultStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    if (doc) {
      setRows((doc.items || []).map(toRow));
      setDirty({});
    }
  }, [doc]);

  const dirtyCount = Object.keys(dirty).length;
  useEffect(() => {
    if (!dirtyCount) return undefined;
    const onLeave = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [dirtyCount]);

  const counts = useMemo(() => {
    const c = { pending: 0, imported: 0, skipped: 0, all: rows.length };
    rows.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => (filter === 'all' || r.status === filter) && (!q || `${r.name} ${r.sku} ${r.description}`.toLowerCase().includes(q)));
  }, [rows, filter, search]);

  const patch = (rowId, changes) => {
    setRows((list) => list.map((r) => (r._id === rowId ? { ...r, ...changes } : r)));
    setDirty((d) => ({ ...d, [rowId]: true }));
  };

  const selectedIds = rows.filter((r) => selected[r._id] && r.status === 'pending').map((r) => r._id);
  const visiblePending = visible.filter((r) => r.status === 'pending');
  const allVisibleSelected = visiblePending.length > 0 && visiblePending.every((r) => selected[r._id]);
  const toggleAll = () => {
    const next = { ...selected };
    visiblePending.forEach((r) => (next[r._id] = !allVisibleSelected));
    setSelected(next);
  };

  /** Save dirty rows; resolves with the fresh document (or the current one when nothing changed). */
  const save = async ({ silent = false } = {}) => {
    const changed = rows.filter((r) => dirty[r._id]).map(toPayload);
    if (!changed.length) return doc;
    setSaving(true);
    try {
      const res = await productService.updateImportItems(id, changed);
      setData(res.data);
      if (!silent) toast.success(`${changed.length} draft${changed.length === 1 ? '' : 's'} saved`);
      return res.data;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const commit = async () => {
    if (!selectedIds.length) {
      toast.error('Tick the drafts you want to import');
      return;
    }
    const blocked = rows.filter((r) => selectedIds.includes(r._id) && rowProblems(r, defaultCategory).length);
    if (blocked.length) {
      toast.error(`${blocked.length} selected draft${blocked.length === 1 ? ' needs' : 's need'} a name, a price and a category first`);
      return;
    }
    setCommitting(true);
    try {
      await save({ silent: true });
      const res = await productService.commitImport(id, selectedIds, {
        categoryId: defaultCategory || '',
        ...(defaultStock !== '' ? { stockQty: Number(defaultStock) } : {}),
      });
      const { created = [], failed = [], import: fresh } = res.data || {};
      if (fresh) setData(fresh);
      const fails = {};
      failed.forEach((f) => (fails[f._id] = f.message));
      setFailures(fails);
      setSelected((s) => {
        const next = { ...s };
        created.forEach((c) => delete next[c._id]);
        return next;
      });
      if (created.length) toast.success(`${created.length} product${created.length === 1 ? '' : 's'} added to the shop`);
      if (failed.length) toast.error(`${failed.length} draft${failed.length === 1 ? '' : 's'} could not be imported`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCommitting(false);
    }
  };

  if (error) {
    return (
      <div className="card">
        <ErrorState message={error.message} onRetry={refetch} />
      </div>
    );
  }
  if (loading || !doc) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const busy = saving || committing;

  return (
    <div>
      <SEOHead title="Review catalogue" noIndex />
      <Link to="/admin/products/import" className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-brand-500">
        <ArrowLeft className="h-4 w-4" /> All imports
      </Link>
      <PageHeader
        title="Review"
        highlight="drafts"
        subtitle={`${doc.fileName} · ${doc.pages} page${doc.pages === 1 ? '' : 's'} · ${counts.pending} to review, ${counts.imported} imported, ${counts.skipped} skipped`}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={Save} onClick={() => save()} loading={saving} disabled={!dirtyCount || committing}>
              Save changes{dirtyCount ? ` (${dirtyCount})` : ''}
            </Button>
            <Button size="sm" icon={PackagePlus} onClick={commit} loading={committing} disabled={saving || !selectedIds.length}>
              Import {selectedIds.length || ''} selected
            </Button>
          </>
        }
      />

      {doc.warnings?.length > 0 && (
        <div className="mb-4 flex gap-3 rounded-xl border border-gold-500/30 bg-gold-500/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-gold-500" />
          <ul className="space-y-1 text-ink">
            {doc.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card mb-4 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drafts" className="input py-2.5 pl-9 text-sm" aria-label="Search drafts" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input py-2.5 text-sm" aria-label="Show">
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label} ({counts[f.value] || 0})
            </option>
          ))}
        </select>
        <select value={defaultCategory} onChange={(e) => setDefaultCategory(e.target.value)} className="input py-2.5 text-sm" aria-label="Default category" title="Used for drafts without their own category">
          <option value="">Default category…</option>
          {(categories || []).map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input type="number" min="0" step="1" inputMode="numeric" value={defaultStock} onChange={(e) => setDefaultStock(e.target.value)} placeholder="Default stock" className="input w-full py-2.5 text-sm md:w-36" aria-label="Default stock quantity" />
      </div>

      {!visible.length ? (
        <div className="card">
          <EmptyState icon={Package} title={rows.length ? 'Nothing matches' : 'No drafts in this import'} description={rows.length ? 'Try another filter or search.' : 'Upload a different PDF.'} compact />
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500/40" checked={allVisibleSelected} onChange={toggleAll} disabled={!visiblePending.length} />
              Select all drafts shown ({visiblePending.length})
            </label>
            <span>{selectedIds.length} selected</span>
          </div>
          <ul className="space-y-3">
            {visible.map((r) => {
              const isOpen = !!expanded[r._id];
              const locked = r.status === 'imported' || busy;
              const problems = r.status === 'pending' ? rowProblems(r, defaultCategory) : [];
              const failure = failures[r._id];
              return (
                <li key={r._id} className={clsx('card p-4 transition', selected[r._id] && r.status === 'pending' && 'ring-2 ring-brand-500/40', r.status === 'skipped' && 'opacity-70')}>
                  <div className="flex gap-3">
                    <div className="flex flex-shrink-0 flex-col items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500/40 disabled:opacity-40"
                        checked={!!selected[r._id] && r.status === 'pending'}
                        onChange={(e) => setSelected((s) => ({ ...s, [r._id]: e.target.checked }))}
                        disabled={r.status !== 'pending'}
                        aria-label={`Select ${r.name || 'draft'}`}
                      />
                      {r.images?.[0] ? (
                        <img src={r.images[0]} alt="" className="h-20 w-20 rounded-lg border border-line object-cover" loading="lazy" />
                      ) : (
                        <span className="flex h-20 w-20 items-center justify-center rounded-lg bg-surface-2 text-muted">
                          <Package className="h-6 w-6" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="grid gap-3 lg:grid-cols-[1fr_8rem_11rem_6rem]">
                        <div>
                          <label className="label text-xs">Product name</label>
                          <input type="text" value={r.name} onChange={(e) => patch(r._id, { name: e.target.value })} disabled={locked} className={clsx('input py-2 text-sm', problems.includes('name') && selected[r._id] && 'input-error')} placeholder="Name" maxLength={120} />
                        </div>
                        <div>
                          <label className="label text-xs">Price (RWF)</label>
                          <input type="number" min="0" step="1" inputMode="numeric" value={r.price} onChange={(e) => patch(r._id, { price: e.target.value })} disabled={locked} className={clsx('input py-2 text-sm', problems.includes('price') && selected[r._id] && 'input-error')} placeholder="0" />
                        </div>
                        <div>
                          <label className="label text-xs">Category</label>
                          <select value={r.categoryId} onChange={(e) => patch(r._id, { categoryId: e.target.value })} disabled={locked} className={clsx('input py-2 text-sm', problems.includes('category') && selected[r._id] && 'input-error')}>
                            <option value="">{defaultCategory ? 'Use default' : 'Choose…'}</option>
                            {(categories || []).map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label text-xs">Stock</label>
                          <input type="number" min="0" step="1" inputMode="numeric" value={r.stockQty} onChange={(e) => patch(r._id, { stockQty: e.target.value })} disabled={locked} className="input py-2 text-sm" />
                        </div>
                      </div>
                      {!isOpen && r.shortDescription && <p className="mt-2 line-clamp-2 text-xs text-muted">{r.shortDescription}</p>}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <StatusBadge status={r.status} />
                        <span className="text-muted">Page {r.page}</span>
                        {r.sku && <span className="font-mono text-muted">{r.sku}</span>}
                        {failure && <span className="text-danger">{failure}</span>}
                        {!failure && problems.length > 0 && selected[r._id] && <span className="text-danger">Needs: {problems.join(', ')}</span>}
                        <span className="flex-1" />
                        {r.status === 'imported' && r.product && (
                          <Link to={`/admin/products/${r.product}/edit`} className="inline-flex items-center gap-1 font-medium text-brand-500 hover:underline">
                            <Pencil className="h-3.5 w-3.5" /> Edit product
                          </Link>
                        )}
                        {r.status === 'pending' && (
                          <button type="button" onClick={() => patch(r._id, { status: 'skipped' })} disabled={busy} className="inline-flex items-center gap-1 text-muted hover:text-ink">
                            <EyeOff className="h-3.5 w-3.5" /> Skip
                          </button>
                        )}
                        {r.status === 'skipped' && (
                          <button type="button" onClick={() => patch(r._id, { status: 'pending' })} disabled={busy} className="inline-flex items-center gap-1 text-muted hover:text-ink">
                            <Undo2 className="h-3.5 w-3.5" /> Restore
                          </button>
                        )}
                        <button type="button" onClick={() => setExpanded((x) => ({ ...x, [r._id]: !isOpen }))} className="inline-flex items-center gap-1 font-medium text-ink hover:text-brand-500">
                          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} {isOpen ? 'Less' : 'Details'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-3">
                      <div className="space-y-4 lg:col-span-2">
                        <div>
                          <label className="label text-xs">Short description</label>
                          <textarea rows={2} maxLength={160} value={r.shortDescription} onChange={(e) => patch(r._id, { shortDescription: e.target.value })} disabled={locked} className="input min-h-[60px] resize-y py-2 text-sm" placeholder="One or two lines shown on product cards" />
                          <p className="help-text">{(r.shortDescription || '').length}/160 characters</p>
                        </div>
                        <div>
                          <label className="label text-xs">Full description</label>
                          <textarea rows={6} value={r.description} onChange={(e) => patch(r._id, { description: e.target.value })} disabled={locked} className="input min-h-[120px] resize-y py-2 text-sm" placeholder="Benefits, usage, dosage…" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="label text-xs">SKU</label>
                            <input type="text" value={r.sku} onChange={(e) => patch(r._id, { sku: e.target.value })} disabled={locked} className="input py-2 font-mono text-sm" placeholder="Auto" maxLength={40} />
                          </div>
                          <div>
                            <label className="label text-xs">Brand</label>
                            <input type="text" value={r.brand || ''} onChange={(e) => patch(r._id, { brand: e.target.value })} disabled={locked} className="input py-2 text-sm" maxLength={60} />
                          </div>
                          <div>
                            <label className="label text-xs">Compare-at price</label>
                            <input type="number" min="0" step="1" inputMode="numeric" value={r.compareAtPrice} onChange={(e) => patch(r._id, { compareAtPrice: e.target.value })} disabled={locked} className="input py-2 text-sm" placeholder="Optional" />
                          </div>
                          <div>
                            <label className="label text-xs">Tags</label>
                            <input type="text" value={r.tags} onChange={(e) => patch(r._id, { tags: e.target.value })} disabled={locked} className="input py-2 text-sm" placeholder="comma, separated" />
                          </div>
                        </div>
                        <Switch label="Requires prescription" description="Pharmacist verifies before dispatch" checked={!!r.requiresPrescription} onChange={(e) => patch(r._id, { requiresPrescription: e.target.checked })} disabled={locked} />
                        {r.sourceText && (
                          <details className="rounded-xl border border-line bg-surface-2/60 p-3 text-xs">
                            <summary className="cursor-pointer font-medium text-ink">Text read from the PDF</summary>
                            <pre className="mt-2 whitespace-pre-wrap font-sans text-muted">{r.sourceText}</pre>
                          </details>
                        )}
                      </div>
                      <div>
                        <label className="label text-xs">Pictures</label>
                        {locked ? (
                          <ul className="grid grid-cols-3 gap-2">
                            {(r.images || []).map((src) => (
                              <li key={src} className="aspect-square overflow-hidden rounded-xl border border-line bg-surface-2">
                                <img src={src} alt="" className="h-full w-full object-cover" />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ImageUploader value={r.images || []} onChange={(images) => patch(r._id, { images })} max={6} />
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" icon={Save} onClick={() => save()} loading={saving} disabled={!dirtyCount || committing}>
          Save changes{dirtyCount ? ` (${dirtyCount})` : ''}
        </Button>
        <Button icon={PackagePlus} onClick={commit} loading={committing} disabled={saving || !selectedIds.length}>
          Import {selectedIds.length || ''} selected
        </Button>
      </div>
    </div>
  );
}
