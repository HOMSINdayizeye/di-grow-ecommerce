import clsx from 'clsx';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title = 'Nothing here yet', description, action, className, compact = false }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center', compact ? 'py-8' : 'py-16', className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-soft">
        <Icon className="h-7 w-7 text-brand-500" />
      </div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
