import { useState } from 'react';
import clsx from 'clsx';
import { SlidersHorizontal, X } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A-Z' },
];

const PRICE_PRESETS = [
  { label: 'Under RWF 10,000', min: '', max: 10000 },
  { label: 'RWF 10,000 - 25,000', min: 10000, max: 25000 },
  { label: 'RWF 25,000 - 50,000', min: 25000, max: 50000 },
  { label: 'Over RWF 50,000', min: 50000, max: '' },
];

/**
 * Sidebar filters. `filters` = { category, minPrice, maxPrice, inStock, prescription }
 * `onChange(partial)` merges values; `onReset()` clears.
 */
export default function ProductFilters({ categories = [], filters, onChange, onReset, className, hideCategories = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = ['category', 'minPrice', 'maxPrice', 'inStock', 'prescription'].filter((k) => filters[k]).length;

  const panel = (
    <div className="space-y-7">
      {!hideCategories && (
        <fieldset>
          <legend className="mb-3 font-ui text-sm font-semibold text-ink">Category</legend>
          <ul className="space-y-1">
            <li>
              <button type="button" onClick={() => onChange({ category: '' })} className={clsx('flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition', !filters.category ? 'bg-gradient-soft font-semibold text-brand-500' : 'text-muted hover:bg-surface-2 hover:text-ink')}>
                All products
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <button type="button" onClick={() => onChange({ category: c.slug })} className={clsx('flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition', filters.category === c.slug ? 'bg-gradient-soft font-semibold text-brand-500' : 'text-muted hover:bg-surface-2 hover:text-ink')}>
                  <span>{c.name}</span>
                  <span className="text-xs opacity-70">{c.productCount}</span>
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-3 font-ui text-sm font-semibold text-ink">Price</legend>
        <ul className="space-y-1">
          {PRICE_PRESETS.map((p) => {
            const selected = String(filters.minPrice || '') === String(p.min) && String(filters.maxPrice || '') === String(p.max);
            return (
              <li key={p.label}>
                <button type="button" onClick={() => onChange(selected ? { minPrice: '', maxPrice: '' } : { minPrice: p.min, maxPrice: p.max })} className={clsx('w-full rounded-lg px-3 py-2 text-left text-sm transition', selected ? 'bg-gradient-soft font-semibold text-brand-500' : 'text-muted hover:bg-surface-2 hover:text-ink')}>
                  {p.label}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center gap-2">
          <input type="number" min="0" placeholder="Min" value={filters.minPrice || ''} onChange={(e) => onChange({ minPrice: e.target.value })} className="input !py-2 text-xs" aria-label="Minimum price" />
          <span className="text-muted">–</span>
          <input type="number" min="0" placeholder="Max" value={filters.maxPrice || ''} onChange={(e) => onChange({ maxPrice: e.target.value })} className="input !py-2 text-xs" aria-label="Maximum price" />
        </div>
        {(filters.minPrice || filters.maxPrice) && (
          <p className="mt-2 text-xs text-muted">
            {filters.minPrice ? formatCurrency(filters.minPrice) : 'RWF 0'} to {filters.maxPrice ? formatCurrency(filters.maxPrice) : 'any'}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-ui text-sm font-semibold text-ink">Availability</legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2">
          <input type="checkbox" checked={filters.inStock === 'true'} onChange={(e) => onChange({ inStock: e.target.checked ? 'true' : '' })} className="h-4 w-4 rounded text-brand-500 focus:ring-brand-500/40" />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2">
          <input type="checkbox" checked={filters.prescription === 'false'} onChange={(e) => onChange({ prescription: e.target.checked ? 'false' : '' })} className="h-4 w-4 rounded text-brand-500 focus:ring-brand-500/40" />
          Hide prescription items
        </label>
      </fieldset>

      {active > 0 && (
        <button type="button" onClick={onReset} className="btn btn-secondary btn-sm w-full">
          <X className="h-4 w-4" /> Clear filters ({active})
        </button>
      )}
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setMobileOpen(true)} className={clsx('btn btn-secondary btn-sm lg:hidden', className)}>
        <SlidersHorizontal className="h-4 w-4" /> Filters {active > 0 && <span className="rounded-pill bg-gradient-brand px-1.5 text-[11px] text-white">{active}</span>}
      </button>

      <aside className={clsx('card hidden h-fit p-5 lg:block lg:sticky lg:top-28', className)}>{panel}</aside>

      <div className={clsx('fixed inset-0 z-[70] lg:hidden', mobileOpen ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!mobileOpen}>
        <div className={clsx('absolute inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setMobileOpen(false)} />
        <aside className={clsx('absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-xl3 bg-surface p-5 shadow-float transition-transform duration-300 scrollbar-thin', mobileOpen ? 'translate-y-0' : 'translate-y-full')}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Filters</h3>
            <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-muted hover:bg-surface-2" aria-label="Close filters">
              <X className="h-5 w-5" />
            </button>
          </div>
          {panel}
          <button type="button" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-md mt-5 w-full">
            Show results
          </button>
        </aside>
      </div>
    </>
  );
}
