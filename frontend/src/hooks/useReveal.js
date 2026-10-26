import { useEffect, useRef } from 'react';

/**
 * Adds the `is-visible` class to elements with `.reveal` inside the returned
 * ref once they scroll into view. Pair with the `.reveal` utility in index.css.
 */
export function useReveal(options = { threshold: 0.12 }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    const targets = root.classList.contains('reveal') ? [root] : Array.from(root.querySelectorAll('.reveal'));
    if (!targets.length) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, options);
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

export default useReveal;
