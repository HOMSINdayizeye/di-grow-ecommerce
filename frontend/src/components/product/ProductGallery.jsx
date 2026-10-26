import { useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import Modal from '@/components/common/Modal';

export default function ProductGallery({ images = [], name = '' }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const list = images.length ? images : ['/images/placeholder-product.svg'];
  const prev = () => setIndex((i) => (i - 1 + list.length) % list.length);
  const next = () => setIndex((i) => (i + 1) % list.length);

  return (
    <div className="space-y-3">
      <div className="card group relative aspect-square overflow-hidden">
        <img src={list[index]} alt={`${name} - image ${index + 1}`} className="h-full w-full object-cover" />
        <button type="button" onClick={() => setZoom(true)} className="absolute right-3 top-3 rounded-full bg-navy-900/60 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100" aria-label="Zoom image">
          <ZoomIn className="h-4 w-4" />
        </button>
        {list.length > 1 && (
          <>
            <button type="button" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-navy-900/60 p-2 text-white backdrop-blur transition hover:bg-navy-900/80" aria-label="Previous image">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-navy-900/60 p-2 text-white backdrop-blur transition hover:bg-navy-900/80" aria-label="Next image">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {list.map((src, i) => (
            <button key={src + i} type="button" onClick={() => setIndex(i)} className={clsx('h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition', i === index ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100')} aria-label={`Show image ${i + 1}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <Modal open={zoom} onClose={() => setZoom(false)} title={name} size="xl">
        <img src={list[index]} alt={name} className="mx-auto max-h-[70vh] rounded-xl object-contain" />
      </Modal>
    </div>
  );
}
