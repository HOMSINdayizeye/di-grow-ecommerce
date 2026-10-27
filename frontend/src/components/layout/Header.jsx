import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Menu, Search, ShoppingBag, X, PackageSearch, Phone, LogIn } from 'lucide-react';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useCart } from '@/hooks/useCart';
import { useSettings } from '@/hooks/useSettings';
import { NAV_LINKS, SITE } from '@/constants/site';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { count, openCart } = useCart();
  const { settings } = useSettings();
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const linkClass = ({ isActive }) =>
    clsx(
      'rounded-pill px-3.5 py-2 font-ui text-sm font-medium transition',
      isActive ? 'bg-gradient-soft text-brand-500' : 'text-ink/80 hover:bg-surface-2 hover:text-ink'
    );

  return (
    <>
      {settings.announcement && (
        <div className="bg-gradient-brand text-center text-xs font-semibold text-white">
          <div className="container py-2">{settings.announcement}</div>
        </div>
      )}

      <header className={clsx('sticky top-0 z-50 transition-all duration-300', scrolled ? 'py-2' : 'py-3 md:py-4')}>
        <div className="container">
          <div
            className={clsx(
              'glass flex items-center justify-between gap-3 rounded-pill px-3 py-2 transition-shadow duration-300 md:px-5',
              scrolled && 'shadow-card'
            )}
          >
            <Logo size="sm" />

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 md:gap-2">
              <button type="button" onClick={() => setSearchOpen((v) => !v)} className="rounded-full p-2.5 text-ink/80 transition hover:bg-surface-2" aria-label="Search products">
                <Search className="h-5 w-5" />
              </button>
              <Link to="/track-order" className="hidden rounded-full p-2.5 text-ink/80 transition hover:bg-surface-2 md:inline-flex" aria-label="Track your order" title="Track order">
                <PackageSearch className="h-5 w-5" />
              </Link>
              <ThemeToggle className="hidden sm:inline-flex" />
              <Link to="/admin/login" className="rounded-full p-2.5 text-ink/80 transition hover:bg-surface-2 md:hidden" aria-label="Login" title="Login">
                <LogIn className="h-5 w-5" />
              </Link>
              <button type="button" onClick={openCart} className="relative rounded-full p-2.5 text-ink/80 transition hover:bg-surface-2" aria-label={`Open cart, ${count} items`}>
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-pill bg-gradient-brand px-1 text-[11px] font-bold text-white shadow-glow">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
              <Link to="/admin/login" className="btn btn-secondary btn-sm hidden md:inline-flex">
                <LogIn className="h-4 w-4" /> Login
              </Link>
              <Link to="/shop" className="btn btn-primary btn-sm hidden md:inline-flex">
                Shop Now
              </Link>
              <button type="button" onClick={() => setMenuOpen(true)} className="rounded-full p-2.5 text-ink/80 transition hover:bg-surface-2 lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={submitSearch} className="glass mt-2 flex items-center gap-2 rounded-pill px-4 py-2 animate-fade-up">
              <Search className="h-4 w-4 text-muted" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories…"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
                aria-label="Search"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="rounded-full p-1.5 text-muted hover:text-ink" aria-label="Close search">
                <X className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={clsx('fixed inset-0 z-[60] lg:hidden', menuOpen ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!menuOpen}>
        <div className={clsx('absolute inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity', menuOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setMenuOpen(false)} />
        <aside className={clsx('absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-surface shadow-float transition-transform duration-300', menuOpen ? 'translate-x-0' : 'translate-x-full')}>
          <div className="flex items-center justify-between border-b border-line p-4">
            <Logo size="sm" />
            <button type="button" onClick={() => setMenuOpen(false)} className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => clsx('rounded-xl px-4 py-3 font-ui text-base font-medium transition', isActive ? 'bg-gradient-soft text-brand-500' : 'text-ink hover:bg-surface-2')}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/track-order" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 font-ui text-base font-medium text-ink hover:bg-surface-2">
              Track Order
            </NavLink>
            <NavLink to="/faq" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 font-ui text-base font-medium text-ink hover:bg-surface-2">
              FAQ
            </NavLink>
            <NavLink to="/admin/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 font-ui text-base font-medium text-ink hover:bg-surface-2">
              <LogIn className="h-4 w-4" /> Staff login
            </NavLink>
          </nav>
          <div className="space-y-3 border-t border-line p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Appearance</span>
              <ThemeToggle />
            </div>
            <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="btn btn-secondary btn-md w-full">
              <Phone className="h-4 w-4" /> {settings.phone}
            </a>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-md w-full">
              Shop Now
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
