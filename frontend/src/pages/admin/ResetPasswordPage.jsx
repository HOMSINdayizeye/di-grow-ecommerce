import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import AuthShell from '@/components/admin/AuthShell';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { adminAuthService } from '@/services/adminAuthService';
import { getErrorMessage } from '@/services/api';
import { resetPasswordSchema } from '@/validations/adminSchemas';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [done, setDone] = useState(null);
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirmPassword: '' } });

  const onSubmit = async ({ password }) => {
    try {
      const res = await adminAuthService.resetPassword(token, password);
      setDone(res?.data?.message || 'Password updated. You can now sign in.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'This reset link is invalid or has expired.'));
    }
  };

  return (
    <AuthShell
      title="Choose a new"
      highlight="password"
      subtitle="Use at least 8 characters. Avoid passwords you use elsewhere."
      footer={
        !done && (
          <Link to="/admin/login" className="inline-flex items-center gap-1 font-medium text-brand-500 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        )
      }
    >
      <SEOHead title="Reset password" noIndex />
      {done ? (
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold">Password updated</h3>
          <p className="mt-2 text-sm text-muted">{done}</p>
          <Button to="/admin/login" className="mt-6 w-full">
            Go to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="password" className="label">
              New password
            </label>
            <div className="relative">
              <input id="password" type={show ? 'text' : 'password'} autoComplete="new-password" className={`input pr-12 ${errors.password ? 'input-error' : ''}`} {...register('password')} />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>
          <FormField label="Confirm password" type={show ? 'text' : 'password'} autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" className="w-full" loading={isSubmitting} icon={KeyRound}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
