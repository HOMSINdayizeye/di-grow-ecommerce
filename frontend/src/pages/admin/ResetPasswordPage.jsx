import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft, MailCheck } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import AuthShell from '@/components/admin/AuthShell';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { adminAuthService } from '@/services/adminAuthService';
import { getErrorMessage } from '@/services/api';
import { resetPasswordSchema } from '@/validations/adminSchemas';

/** Step 2 of the reset: the 5-digit code from the email plus the new password. */
export default function ResetPasswordPage() {
  const { state } = useLocation();
  const presetEmail = state?.email || '';
  const [done, setDone] = useState(null);
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { email: presetEmail, code: '', password: '', confirmPassword: '' } });

  const onSubmit = async ({ email, code, password }) => {
    try {
      const res = await adminAuthService.resetPassword({ email, code, password });
      setDone(res?.data?.message || 'Password updated. You can now sign in.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'That code is wrong or has expired.'));
    }
  };

  return (
    <AuthShell
      title="Enter your"
      highlight="code"
      subtitle={presetEmail ? `We sent a 5-digit code to ${presetEmail}. It expires in 10 minutes.` : 'Type the 5-digit code from the email and choose a new password.'}
      footer={
        !done && (
          <span className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/admin/login" className="inline-flex items-center gap-1 font-medium text-brand-500 hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
            <Link to="/admin/forgot-password" className="font-medium text-brand-500 hover:underline">
              Send a new code
            </Link>
          </span>
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
          {presetEmail && (
            <p className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-xs text-success">
              <MailCheck className="h-4 w-4 flex-shrink-0" /> Check your inbox and spam folder for the code.
            </p>
          )}
          <FormField label="Email" type="email" autoComplete="email" placeholder="you@digrow.rw" error={errors.email?.message} {...register('email')} />
          <FormField
            label="5-digit code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={5}
            placeholder="12345"
            inputClassName="text-center font-mono text-2xl tracking-[0.5em]"
            error={errors.code?.message}
            {...register('code')}
          />
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
