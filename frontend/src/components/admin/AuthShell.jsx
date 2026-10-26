import { Link } from 'react-router-dom';
import { ShieldCheck, Bell, BarChart3 } from 'lucide-react';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';

const FEATURES = [
  { icon: Bell, text: 'Real-time alerts the moment a customer sends an order request' },
  { icon: ShieldCheck, text: 'Prescription flags so the pharmacist checks before dispatch' },
  { icon: BarChart3, text: 'Daily revenue, stock and delivery reports for Kigali' },
];

/**
 * Split-screen shell for the standalone admin auth pages (login, forgot, reset).
 */
export default function AuthShell({ title, highlight, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-hero text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full glow-brand blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full glow-accent blur-3xl" />
        <div className="relative">
          <Logo light size="lg" to="/" />
        </div>
        <div className="relative max-w-md">
          <span className="eyebrow mb-5">Admin console</span>
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Run the shop from <span className="text-gradient">one place</span>
          </h1>
          <p className="mt-4 text-white/70">Orders, products, deliveries and reports for the Di-Grow team in Kigali.</p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/85">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-accent-300">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} Di-Grow · Kigali, Rwanda</p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col px-4 py-8 sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <Logo size="sm" to="/" className="lg:hidden" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="card w-full max-w-md p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">
              {title} {highlight && <span className="text-gradient">{highlight}</span>}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
          </div>
        </div>
        <p className="text-center text-xs text-muted">
          <Link to="/" className="hover:text-brand-500">
            Back to storefront
          </Link>
        </p>
      </main>
    </div>
  );
}
