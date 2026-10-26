import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to top on route change (ignores hash links and search-only changes). */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}
