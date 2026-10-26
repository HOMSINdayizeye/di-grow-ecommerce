import { useRef, useState } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { UploadCloud, X, Star, Link2, Loader2, ImageIcon } from 'lucide-react';
import { productService } from '@/services/productService';
import { getErrorMessage } from '@/services/api';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Drag-and-drop image uploader bound to an array of URLs.
 *   <ImageUploader value={urls} onChange={setUrls} max={6} />
 */
export default function ImageUploader({ value = [], onChange, max = 6, className }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState([]); // [{ id, name, preview, status: 'uploading'|'error', error }]
  const [url, setUrl] = useState('');

  const urls = Array.isArray(value) ? value : [];
  const remaining = max - urls.length - uploads.filter((u) => u.status === 'uploading').length;
  const full = remaining <= 0;

  const patchUpload = (id, patch) => setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  const dropUpload = (id) => setUploads((list) => list.filter((u) => u.id !== id));

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const accepted = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} is larger than 2MB`);
        continue;
      }
      accepted.push(file);
    }
    const slots = Math.max(0, max - urls.length - uploads.filter((u) => u.status === 'uploading').length);
    if (accepted.length > slots) {
      toast.error(`You can add up to ${max} image${max === 1 ? '' : 's'}`);
    }
    const toUpload = accepted.slice(0, slots);
    let current = urls;
    await Promise.all(
      toUpload.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const preview = URL.createObjectURL(file);
        setUploads((list) => [...list, { id, name: file.name, preview, status: 'uploading' }]);
        try {
          const res = await productService.uploadImage(file);
          const uploaded = res?.data?.url;
          if (!uploaded) throw new Error('Upload failed');
          current = max === 1 ? [uploaded] : [...current, uploaded].slice(0, max);
          onChange?.(current);
          dropUpload(id);
        } catch (err) {
          patchUpload(id, { status: 'error', error: getErrorMessage(err, 'Upload failed') });
          toast.error(`${file.name}: ${getErrorMessage(err, 'Upload failed')}`);
        } finally {
          URL.revokeObjectURL(preview);
        }
      })
    );
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const remove = (idx) => onChange?.(urls.filter((_, i) => i !== idx));
  const setCover = (idx) => {
    if (idx === 0) return;
    const next = [...urls];
    const [img] = next.splice(idx, 1);
    onChange?.([img, ...next]);
  };

  const addUrl = () => {
    const v = url.trim();
    if (!v) return;
    if (!/^(https?:\/\/|data:image\/)/i.test(v)) {
      toast.error('Enter a valid image URL (starting with http:// or https://)');
      return;
    }
    if (full) {
      toast.error(`You can add up to ${max} image${max === 1 ? '' : 's'}`);
      return;
    }
    onChange?.(max === 1 ? [v] : [...urls, v]);
    setUrl('');
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !full && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !full && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={full ? (e) => e.preventDefault() : onDrop}
        className={clsx(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl2 border-2 border-dashed px-4 py-8 text-center transition',
          dragging ? 'border-brand-500 bg-brand-500/10' : 'border-line hover:border-brand-500/50 hover:bg-surface-2/60',
          full && 'cursor-not-allowed opacity-60'
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-soft text-brand-500">
          <UploadCloud className="h-5 w-5" />
        </span>
        <p className="mt-3 text-sm font-medium text-ink">{full ? 'Image limit reached' : 'Drop images here or click to browse'}</p>
        <p className="mt-1 text-xs text-muted">
          PNG, JPG or WebP · up to 2MB each · {urls.length}/{max}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={max > 1}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {(urls.length > 0 || uploads.length > 0) && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((src, i) => (
            <li key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-2">
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 badge bg-gradient-brand text-[10px] text-white">
                  <Star className="h-3 w-3" /> Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-navy-950/80 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                {i !== 0 && max > 1 && (
                  <button type="button" onClick={() => setCover(i)} className="rounded-full bg-white/90 p-1.5 text-navy-900 hover:bg-white" title="Set as cover" aria-label="Set as cover">
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => remove(i)} className="rounded-full bg-white/90 p-1.5 text-danger hover:bg-white" title="Remove" aria-label="Remove image">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          {uploads.map((u) => (
            <li key={u.id} className="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-2">
              {u.preview ? <img src={u.preview} alt="" className="h-full w-full object-cover opacity-60" /> : <ImageIcon className="m-auto h-6 w-6 text-muted" />}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-navy-950/40 text-white">
                {u.status === 'uploading' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-[10px]">Uploading…</span>
                  </>
                ) : (
                  <>
                    <span className="px-2 text-center text-[10px] text-red-200">{u.error || 'Failed'}</span>
                    <button type="button" onClick={() => dropUpload(u.id)} className="rounded-full bg-white/90 p-1 text-danger" aria-label="Dismiss">
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="Or paste an image URL"
            className="input py-2.5 pl-9 text-sm"
            disabled={full}
          />
        </div>
        <button type="button" onClick={addUrl} className="btn btn-secondary btn-sm" disabled={full || !url.trim()}>
          Add
        </button>
      </div>
    </div>
  );
}
