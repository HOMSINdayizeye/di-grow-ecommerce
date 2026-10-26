import clsx from 'clsx';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ className }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={clsx('relative inline-flex h-9 w-16 items-center rounded-pill border bg-surface-2 px-1 transition', className)}
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <span className={clsx('flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-white shadow transition-transform', isDark ? 'translate-x-7' : 'translate-x-0')}>
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
