import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  whatsapp: 'btn-whatsapp',
};
const sizes = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };

/**
 * <Button variant="primary|secondary|ghost|danger|whatsapp" size="sm|md|lg" to="/path" href="..." loading />
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className, loading = false, disabled, to, href, children, icon: Icon, iconRight: IconRight, ...props },
  ref
) {
  const classes = clsx('btn', variants[variant], sizes[size], className);
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
      {IconRight && !loading ? <IconRight className="h-4 w-4" /> : null}
    </>
  );
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || loading} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type="button" className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
});

export default Button;
