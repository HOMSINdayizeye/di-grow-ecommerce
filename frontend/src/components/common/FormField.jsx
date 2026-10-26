import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Generic labelled form control for react-hook-form.
 *   <FormField label="Name" error={errors.name?.message} {...register('name')} />
 *   <FormField as="select" ...><option/></FormField>
 *   <FormField as="textarea" rows={4} />
 */
const FormField = forwardRef(function FormField(
  { label, error, help, as = 'input', className, inputClassName, required, children, id, ...props },
  ref
) {
  const Tag = as;
  const fieldId = id || props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="label">
          {label} {required && <span className="text-accent-500">*</span>}
        </label>
      )}
      <Tag
        ref={ref}
        id={fieldId}
        className={clsx('input', error && 'input-error', as === 'textarea' && 'min-h-[110px] resize-y', inputClassName)}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      >
        {children}
      </Tag>
      {error ? (
        <p id={`${fieldId}-error`} className="error-text">
          {error}
        </p>
      ) : help ? (
        <p className="help-text">{help}</p>
      ) : null}
    </div>
  );
});

export default FormField;

/** Checkbox / toggle row. */
export const Checkbox = forwardRef(function Checkbox({ label, description, error, className, ...props }, ref) {
  return (
    <div className={className}>
      <label className="flex cursor-pointer items-start gap-3">
        <input ref={ref} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500/40" {...props} />
        <span className="text-sm">
          <span className="font-medium text-ink">{label}</span>
          {description && <span className="block text-xs text-muted">{description}</span>}
        </span>
      </label>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
});

export const Switch = forwardRef(function Switch({ label, description, checked, onChange, className, ...props }, ref) {
  return (
    <label className={clsx('flex cursor-pointer items-center justify-between gap-4', className)}>
      <span className="text-sm">
        <span className="font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
      <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center">
        <input ref={ref} type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} {...props} />
        <span className="absolute inset-0 rounded-pill bg-muted/30 transition peer-checked:bg-gradient-brand" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
});
