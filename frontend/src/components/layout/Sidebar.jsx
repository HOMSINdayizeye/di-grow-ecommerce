import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  FileText,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ROLES } from '@/constants/roles';

export const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: Tags },
  { label: 'Blog', to: '/admin/blog', icon: FileText },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3, roles: [ROLES.ADMIN] },
  { label: 'Staff', to: '/admin/staff', icon: Users, roles: [ROLES.ADMIN] },
  { label: 'Settings', to: '/admin/settings', icon: Settings, roles: [ROLES.ADMIN] },
];

export default function Sidebar({ open, onClose, newOrders = 0 }) {
  const { user, logout } = useAdminAuth();
  const items = ADMIN_NAV.filter((i) => !i.roles || i.roles.includes(user?.role));

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo to="/admin" size="sm" />
        <button type="button" onClick={onClose} className="rounded-full p-2 text-muted hover:bg-surface-2 lg:hidden" aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 scrollbar-thin" aria-label="Admin">
        {items.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 font-ui text-sm font-medium transition',
                isActive ? 'bg-gradient-brand text-white shadow-glow' : 'text-muted hover:bg-surface-2 hover:text-ink'
              )
            }
          >
            <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            <span className="flex-1">{label}</span>
            {label === 'Orders' && newOrders > 0 && (
              <span className="rounded-pill bg-accent-500 px-2 py-0.5 text-[11px] font-bold text-white">{newOrders}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 border-t border-line p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink">
          <ExternalLink className="h-[18px] w-[18px]" /> View storefront
        </a>
        <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-xs capitalize text-muted">{user?.role}</p>
          </div>
          <button type="button" onClick={logout} className="rounded-full p-2 text-muted transition hover:bg-danger/15 hover:text-danger" aria-label="Sign out" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 border-r border-line bg-surface lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>
      <div className={clsx('fixed inset-0 z-50 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
        <div className={clsx('absolute inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
        <aside className={clsx('absolute left-0 top-0 h-full w-72 bg-surface shadow-float transition-transform duration-300', open ? 'translate-x-0' : '-translate-x-full')}>
          {content}
        </aside>
      </div>
    </>
  );
}
