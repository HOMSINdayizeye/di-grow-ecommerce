import clsx from 'clsx';
import { FileCheck2 } from 'lucide-react';

/** Marks products that need a verified prescription before dispensing. */
export default function PrescriptionBadge({ className, size = 'sm', withText = true }) {
  return (
    <span
      className={clsx(
        'badge border border-accent-500/40 bg-accent-500/15 text-accent-500',
        size === 'md' && 'px-3 py-1.5 text-sm',
        className
      )}
      title="A valid prescription is required. Our pharmacist will verify it when we call."
    >
      <FileCheck2 className={size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      {withText && (size === 'md' ? 'Prescription required' : 'Rx')}
    </span>
  );
}
