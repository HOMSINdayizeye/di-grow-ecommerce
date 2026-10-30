import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft, MailCheck, ShieldCheck } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import AuthShell from '@/components/admin/AuthShell';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { adminAuthService } from '@/services/adminAuthService';
import { getErrorMessage } from '@/services/api';
import { verifyResetCodeSchema, resetPasswordSchema } from '@/validations/adminSchemas';

/** Step 1: the emailed 5-digit code. Only a verified code reveals the password fields. */
function CodeStep({ presetEmail, onVerified }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(verifyResetCodeSchema), defaultValues: { email: presetEmail, code: '' } });

  const onSubmit = async ({ email, code }) => {
    try {
      await adminAuthService.verifyResetCode({ email, code });
      toast.success('Code verified');
      onVerified({ email, code });
    } catch (err) {
      toast.error(getErrorMessage(err, 'That code is wrong or has expired.'));
    }
  };

  return (
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
      <Button type="submit" className="w-full" loading={isSubmitting} icon={ShieldCheck}>
        Verify code
      </Button>
    </form>
  );
}

/** Step 2: the new password, sent together with the already verified code. */
function PasswordStep({ email, code, onDone, onBack }) {
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirmPassword: '' } });

  const onSubmit = async ({ password }) => {
    try {
      const res = await adminAuthService.resetPassword({ email, code, password });
      onDone(res?.data?.message || 'Password updated. You can now sign in.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'That code is wrong or has expired.'));
      // The code was discarded (expired or too many tries): go back so a new one can be requested.
      if (err?.response?.status === 400) onBack();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-xs text-success">
        <ShieldCheck className="h-4 w-4 flex-shrink-0" /> Code verified for {email}. Choose your new password.
      </p>
      <div>
        <label htmlFor="password" className="label">
          New password
        </label>
        <div className="relative">
          <input id="password" type={show ? 'text' : 'password'} autoComplete="new-password" autoFocus className={`input pr-12 ${errors.password ? 'input-error' : ''}`} {...register('password')} />
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
  );
}

export default function ResetPasswordPage() {
  const { state } = useLocation();
  const presetEmail = state?.email || '';
  const [verified, setVerified] = useState(null); // { email, code } once step 1 passed
  const [done, setDone] = useState(null);

  const step = done ? 'done' : verified ? 'password' : 'code';
  const copy = {
    code: { title: 'Enter your', highlight: 'code', subtitle: presetEmail ? `We sent a 5-digit code to ${presetEmail}. It expires in 10 minutes.` : 'Type the 5-digit code from the email.' },
    password: { title: 'Choose a new', highlight: 'password', subtitle: 'Use at least 8 characters. Avoid passwords you use elsewhere.' },
    done: { title: 'All', highlight: 'done', subtitle: 'Your password has been changed.' },
  }[step];

  return (
    <AuthShell
      title={copy.title}
      highlight={copy.highlight}
      subtitle={copy.subtitle}
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
      {step === 'done' && (
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
      )}
      {step === 'code' && <CodeStep presetEmail={presetEmail} onVerified={setVerified} />}
      {step === 'password' && <PasswordStep email={verified.email} code={verified.code} onDone={setDone} onBack={() => setVerified(null)} />}
    </AuthShell>
  );
}
