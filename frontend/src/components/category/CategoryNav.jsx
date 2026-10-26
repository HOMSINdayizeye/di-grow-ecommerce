import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { getCategoryIcon } from '@/constants/categoryIcons';

export function CategoryIcon({ name, className }) {
  const Icon = getCategoryIcon(name);
  return <Icon className={className} />;
}

/**
 * Category navigation. `variant="cards"` for the home grid, `"pills"` for a
 * horizontal scroll strip at the top of the shop.
 */
export default function CategoryNav({ categories = [], variant = 'cards', active, className }) {
  if (variant === 'pills') {
    return (
      <div className={clsx('flex gap-2 overflow-x-auto pb-2 scrollbar-thin', className)}>
        <Link to="/shop" className={clsx('btn btn-sm whitespace-nowrap', !active ? 'btn-primary' : 'btn-secondary')}>
          All
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} to={`/category/${c.slug}`} className={clsx('btn btn-sm whitespace-nowrap', active === c.slug ? 'btn-primary' : 'btn-secondary')}>
            <CategoryIcon name={c.icon} className="h-4 w-4" /> {c.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {categories.map((c, i) => (
        <Link key={c.slug} to={`/category/${c.slug}`} className="card card-hover reveal group relative overflow-hidden p-5" style={{ transitionDelay: `${i * 60}ms` }}>
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full glow-brand opacity-0 blur-2xl transition group-hover:opacity-100" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl2 bg-gradient-soft text-brand-500 transition group-hover:bg-gradient-brand group-hover:text-white">
            <CategoryIcon name={c.icon} className="h-6 w-6" />
          </div>
          <h3 className="relative mt-4 font-sans text-base font-semibold text-ink">{c.name}</h3>
          <p className="relative mt-1 line-clamp-2 text-xs text-muted">{c.description}</p>
          <p className="relative mt-3 text-xs font-semibold text-brand-500">{c.productCount} products →</p>
        </Link>
      ))}
    </div>
  );
}
