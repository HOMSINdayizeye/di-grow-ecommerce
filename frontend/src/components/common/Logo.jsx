import { Link } from 'react-router-dom';
import clsx from 'clsx';

/**
 * Site logo, from /public/brand (transparent PNGs). Replace those files to change the logo everywhere:
 *  - digrow-wordmark.png: "D.I.GROW" only, used in headers and the sidebar
 *  - digrow-logo.png: with the "ORGANIC PLUS Foliar fertilizer" tagline, used where there is room
 */
export const LOGO_SRC = '/brand/digrow-logo.png';
export const WORDMARK_SRC = '/brand/digrow-wordmark.png';

export default function Logo({ to = '/', className, size = 'md', tagline = false }) {
  const height = size === 'sm' ? 'h-10' : size === 'lg' ? 'h-20' : 'h-12';
  return (
    <Link to={to} className={clsx('inline-flex items-center', className)} aria-label="D.I.GROW home">
      <img src={tagline ? LOGO_SRC : WORDMARK_SRC} alt="D.I.GROW" className={clsx(height, 'w-auto max-w-[260px] object-contain')} />
    </Link>
  );
}
