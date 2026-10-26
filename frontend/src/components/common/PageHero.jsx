import Breadcrumbs from './Breadcrumbs';

/** Compact hero banner for inner pages. */
export default function PageHero({ eyebrow, title, highlight, subtitle, breadcrumbs, children }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-hero text-white">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full glow-brand blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full glow-accent blur-3xl" />
      <div className="container relative py-14 md:py-20">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-6 [&_a]:text-white/70 [&_span]:text-white [&_li]:text-white/60" />}
        {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
        <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight text-balance md:text-5xl lg:text-6xl">
          {title} {highlight && <span className="text-gradient">{highlight}</span>}
        </h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base text-white/75 md:text-lg">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
