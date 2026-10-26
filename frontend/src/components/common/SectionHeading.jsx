import clsx from 'clsx';

/** Eyebrow + title + subtitle used at the top of marketing sections. */
export default function SectionHeading({ eyebrow, title, highlight, subtitle, align = 'center', className }) {
  return (
    <div className={clsx(align === 'center' ? 'text-center' : 'text-left', 'reveal', className)}>
      {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
      <h2 className="section-title text-balance">
        {title} {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {subtitle && <p className={clsx('section-subtitle', align !== 'center' && 'mx-0')}>{subtitle}</p>}
    </div>
  );
}
