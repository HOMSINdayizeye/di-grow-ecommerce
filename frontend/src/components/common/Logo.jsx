import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function Logo({ to = '/', className, size = 'md', light = false }) {
  const dims = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const text = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  return (
    <Link to={to} className={clsx('inline-flex items-center gap-2.5', className)} aria-label="Di-Grow home">
      <img src="/logo.svg" alt="" className={dims} />
      <span className={clsx('font-display font-extrabold tracking-tight', text, light ? 'text-white' : 'text-ink')}>
        Di<span className="text-gradient">-Grow</span>
      </span>
    </Link>
  );
}
