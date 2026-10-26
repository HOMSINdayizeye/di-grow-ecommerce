import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, Info } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import AuthShell from '@/components/admin/AuthShell';
import FormField, { Checkbox } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getErrorMessage } from '@/services/api';
import { loginSchema } from '@/validations/adminSchemas';

const SHOW_DEMO = import.meta.env.VITE_USE_MOCK === 'true';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  if (loading) return <Loader full label="Checking your session…" />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Invalid email or password'));
    }
  };

  return (
    <AuthShell
      title="Sign in to"
      highlight="Di-Grow"
      subtitle="Use your staff account to manage orders and products."
      footer={
        <>
          Forgot your password?{' '}
          <Link to="/admin/forgot-password" className="font-medium text-brand-500 hover:underline">
            Reset it
          </Link>
        </>
      }
    >
      <SEOHead title="Admin sign in" noIndex />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email" type="email" autoComplete="email" placeholder="you@digrow.rw" error={errors.email?.message} {...register('email')} />
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>
        <Checkbox label="Keep me signed in on this device" {...register('remember')} />
        <Button type="submit" className="w-full" loading={isSubmitting} icon={LogIn}>
          Sign in
        </Button>
      </form>

      {SHOW_DEMO && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 p-3 text-xs text-ink">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
          <span>
            Demo: <span className="font-mono font-semibold">admin@digrow.rw</span> / <span className="font-mono font-semibold">admin123</span>
          </span>
        </div>
      )}
    </AuthShell>
  );
}
