import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import BreadcrumbSchema from '@/seo/BreadcrumbSchema';

/** items: [{ label, to? }] - last item is the current page. */
export default function Breadcrumbs({ items = [], className }) {
  const all = [{ label: 'Home', to: '/' }, ...items];
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <BreadcrumbSchema items={all} />
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {all.map((item, i) => {
          const last = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              {last || !item.to ? (
                <span className="font-medium text-ink" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="inline-flex items-center gap-1 transition hover:text-brand-500">
                  {i === 0 && <Home className="h-3.5 w-3.5" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
