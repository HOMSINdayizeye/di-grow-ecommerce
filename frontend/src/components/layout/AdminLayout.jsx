import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Wifi, WifiOff } from 'lucide-react';
import Sidebar, { ADMIN_NAV } from './Sidebar';
import ThemeToggle from '@/components/common/ThemeToggle';
import NotificationBell from '@/components/admin/NotificationBell';
import Loader from '@/components/common/Loader';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { SocketProvider, useSocketContext } from '@/context/SocketContext';
import SEOHead from '@/seo/SEOHead';
import { USE_MOCK } from '@/services/api';

function TopBar({ onMenu }) {
  const { pathname } = useLocation();
  const { connected } = useSocketContext();
  const current = [...ADMIN_NAV].reverse().find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)));

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenu} className="rounded-full p-2 text-muted hover:bg-surface-2 lg:hidden" aria-label="Open sidebar">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold md:text-xl">{current?.label || 'Admin'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {USE_MOCK && (
            <span className="inline-flex items-center rounded-pill border border-gold-500/40 bg-gold-500/15 px-2.5 py-1 text-xs font-semibold text-gold-500" title="VITE_USE_MOCK=true: data lives only in this browser and is not saved to the API">
              Demo data
            </span>
          )}
          <span className="hidden items-center gap-1.5 rounded-pill border border-line px-2.5 py-1 text-xs text-muted sm:inline-flex" title={connected ? 'Live updates connected' : 'Live updates offline'}>
            {connected ? <Wifi className="h-3.5 w-3.5 text-success" /> : <WifiOff className="h-3.5 w-3.5 text-danger" />}
            {connected ? 'Live' : 'Offline'}
          </span>
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Shell() {
  const [open, setOpen] = useState(false);
  const { unseen } = useSocketContext();
  return (
    <div className="flex min-h-screen bg-bg">
      <SEOHead title="Admin" noIndex />
      <Sidebar open={open} onClose={() => setOpen(false)} newOrders={unseen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <ErrorBoundary>
            <Suspense fallback={<Loader full />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <SocketProvider>
      <Shell />
    </SocketProvider>
  );
}
