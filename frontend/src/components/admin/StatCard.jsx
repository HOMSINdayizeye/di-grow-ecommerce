import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowUpRight } from 'lucide-react';

const TONES = {
  brand: 'bg-brand-500/15 text-brand-500',
  accent: 'bg-accent-500/15 text-accent-500',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  gold: 'bg-gold-500/15 text-gold-500',
};

/**
 * <StatCard title="Orders today" value={12} icon={ShoppingCart} delta="+12%" tone="brand" to="/admin/orders" />
 */
export default function StatCard({ title, value, icon: Icon, delta, tone = 'brand', to, className }) {
  const deltaTone = !delta ? '' : delta.startsWith('+') ? 'text-success' : delta.startsWith('-') ? 'text-danger' : 'text-muted';

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={clsx('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', TONES[tone] || TONES.brand)}>
          {Icon && <Icon className="h-5 w-5" />}
        </span>
        {to && <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-brand-500" />}
      </div>
      <p className="mt-4 font-display text-2xl font-bold leading-none text-ink md:text-3xl">{value}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">{title}</p>
        {delta && <span className={clsx('text-xs font-semibold', deltaTone)}>{delta}</span>}
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={clsx('card card-hover group block p-5', className)}>
        {body}
      </Link>
    );
  }
  return <div className={clsx('card p-5', className)}>{body}</div>;
}
