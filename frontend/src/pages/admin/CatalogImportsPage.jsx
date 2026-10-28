import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { ArrowLeft, FileUp, FileText, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import ErrorState from '@/components/admin/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/common/Modal';
import { TableSkeleton } from '@/components/common/Loader';
import { useFetch } from '@/hooks/useFetch';
import { productService } from '@/services/productService';
import { getErrorMessage } from '@/services/api';

const MAX_SIZE = 40 * 1024 * 1024;

const fmtSize = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const fmtDate = (d) => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * Upload a catalogue PDF. The API reads the pictures and the text next to them and turns
 * them into product candidates; the admin then reviews them, adds prices and imports.
 */
export default function CatalogImportsPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { data: imports, loading, error, refetch } = useFetch(() => productService.listImports(), [], { initialData: [] });

  const handleFile = async (file) => {
    if (!file || uploading) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      toast.error('Choose a PDF file');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('PDF must be 40 MB or smaller');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const res = await productService.importCatalog(file, setProgress);
      const doc = res?.data;
      const n = doc?.items?.length || 0;
      toast.success(`${n} product${n === 1 ? '' : 's'} found on ${doc?.pages || 0} page${doc?.pages === 1 ? '' : 's'}`);
      navigate(`/admin/products/import/${doc._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'The PDF could not be read'));
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await productService.removeImport(toDelete._id);
      toast.success('Import deleted');
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <SEOHead title="Import catalogue" noIndex />
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-brand-500">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <PageHeader title="Import a" highlight="PDF catalogue" subtitle="Upload a supplier or brand catalogue. Pictures and the text next to them become product drafts you can price and edit before they go live." />

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!uploading) handleFile(e.dataTransfer.files?.[0]);
        }}
        className={clsx(
          'card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-4 py-12 text-center transition',
          dragging ? 'border-brand-500 bg-brand-500/10' : 'hover:border-brand-500/50 hover:bg-surface-2/60',
          uploading && 'cursor-wait'
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-soft text-brand-500">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileUp className="h-6 w-6" />}
        </span>
        {uploading ? (
          <>
            <p className="mt-4 text-sm font-medium text-ink">{progress < 100 ? `Uploading… ${progress}%` : 'Reading pages and pictures…'}</p>
            <p className="mt-1 text-xs text-muted">Large catalogues can take a minute. Keep this page open.</p>
            <div className="mt-4 h-1.5 w-64 overflow-hidden rounded-pill bg-surface-2">
              <div className={clsx('h-full rounded-pill bg-gradient-brand transition-all', progress >= 100 && 'animate-pulse')} style={{ width: `${Math.max(8, progress)}%` }} />
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm font-medium text-ink">Drop a PDF catalogue here or click to browse</p>
            <p className="mt-1 text-xs text-muted">PDF with selectable text and embedded pictures · up to 40 MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      <div className="mt-6 grid gap-3 text-sm text-muted sm:grid-cols-3">
        <div className="card p-4">
          <p className="font-semibold text-ink">1. Upload</p>
          <p className="mt-1 text-xs">Each picture becomes a draft product with the name, description, code and price printed next to it.</p>
        </div>
        <div className="card p-4">
          <p className="font-semibold text-ink">2. Review</p>
          <p className="mt-1 text-xs">Add or correct prices, pick a category, fix names and descriptions. Your edits are saved on the draft.</p>
        </div>
        <div className="card p-4">
          <p className="font-semibold text-ink">3. Import</p>
          <p className="mt-1 text-xs">Selected drafts become real products in the shop. You can still edit them later like any other product.</p>
        </div>
      </div>

      <h3 className="mb-3 mt-8 font-ui text-sm font-semibold">Previous imports</h3>
      {error ? (
        <div className="card">
          <ErrorState message={error.message} onRetry={refetch} compact />
        </div>
      ) : loading && !(imports || []).length ? (
        <div className="card overflow-hidden">
          <TableSkeleton rows={3} cols={4} />
        </div>
      ) : !(imports || []).length ? (
        <div className="card">
          <EmptyState icon={FileText} title="No catalogues imported yet" description="Upload a PDF above to get started." compact />
        </div>
      ) : (
        <ul className="card divide-y divide-line/10 overflow-hidden">
          {imports.map((imp) => (
            <li key={imp._id} className="flex items-center gap-3 p-4 transition hover:bg-surface-2/60">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <Link to={`/admin/products/import/${imp._id}`} className="block truncate font-medium text-ink hover:text-brand-500">
                  {imp.fileName}
                </Link>
                <p className="text-xs text-muted">
                  {fmtDate(imp.createdAt)} · {imp.pages} page{imp.pages === 1 ? '' : 's'} · {fmtSize(imp.fileSize)}
                  {imp.createdByName ? ` · by ${imp.createdByName}` : ''}
                </p>
              </div>
              <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
                {imp.pending > 0 && <span className="badge border border-gold-500/30 bg-gold-500/15 text-gold-500">{imp.pending} to review</span>}
                {imp.imported > 0 && <span className="badge border border-success/30 bg-success/15 text-success">{imp.imported} imported</span>}
                {imp.skipped > 0 && <span className="badge border border-line bg-surface-2 text-muted">{imp.skipped} skipped</span>}
              </div>
              <button type="button" onClick={() => setToDelete(imp)} className="rounded-full p-2 text-muted transition hover:bg-danger/15 hover:text-danger" aria-label={`Delete ${imp.fileName}`} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
              <Link to={`/admin/products/import/${imp._id}`} className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-brand-500" aria-label="Open">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this import?"
        message={toDelete ? `The drafts from "${toDelete.fileName}" will be removed. Products you already imported from it stay in the shop.` : ''}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
