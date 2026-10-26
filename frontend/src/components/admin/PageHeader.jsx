import clsx from 'clsx';

/**
 * Admin page header: h2 (font-display 2xl) with one highlighted word, muted subtitle
 * and right-aligned actions.
 *   <PageHeader title="All" highlight="Orders" subtitle="..." actions={<Button/>} />
 */
export default function PageHeader({ title, highlight, subtitle, actions, className }) {
  return (
    <div className={clsx('mb-6 flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        <h2 className="font-display text-2xl font-bold">
          {title} {highlight && <span className="text-gradient">{highlight}</span>}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 print:hidden">{actions}</div>}
    </div>
  );
}
