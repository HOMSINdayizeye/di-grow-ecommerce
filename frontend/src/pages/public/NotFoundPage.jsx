import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Mail, Search, ArrowRight } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/shop');
  };

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden">
      <SEOHead title="Page not found" description="The page you are looking for does not exist." noIndex />
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full glow-brand blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full glow-accent blur-3xl" />

      <div className="container relative py-16 text-center md:py-24">
        <p className="font-display text-[7rem] font-extrabold leading-none text-gradient animate-fade-up sm:text-[9rem] md:text-[12rem]">404</p>
        <span className="eyebrow mt-2 animate-fade-up" style={{ animationDelay: '80ms' }}>Page not found</span>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-extrabold text-balance animate-fade-up md:text-5xl" style={{ animationDelay: '140ms' }}>
          This page took a <span className="text-gradient">different road</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted animate-fade-up md:text-lg" style={{ animationDelay: '200ms' }}>
          The link may be broken or the page may have moved. Try searching the shop, or head back home.
        </p>

        <form onSubmit={onSearch} role="search" className="mx-auto mt-8 flex max-w-md items-center gap-2 animate-fade-up" style={{ animationDelay: '260ms' }}>
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input !rounded-pill !pl-12" />
          </label>
          <button type="submit" className="btn btn-primary btn-md flex-shrink-0" aria-label="Search">
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '320ms' }}>
          <Link to="/" className="btn btn-primary btn-md">
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link to="/shop" className="btn btn-secondary btn-md">
            <ShoppingBag className="h-4 w-4" /> Shop
          </Link>
          <Link to="/contact" className="btn btn-ghost btn-md">
            <Mail className="h-4 w-4" /> Contact
          </Link>
        </div>
      </div>
    </section>
  );
}
