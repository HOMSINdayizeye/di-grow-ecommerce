import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { MailCheck, Send, ArrowLeft } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import AuthShell from '@/components/admin/AuthShell';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { adminAuthService } from '@/services/adminAuthService';
import { getErrorMessage } from '@/services/api';
import { forgotPasswordSchema } from '@/validations/adminSchemas';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    try {
      const res = await adminAuthService.forgotPassword(email);
      setSent(res?.data?.message || 'If that email exists, a reset link has been sent.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthShell
      title="Reset your"
      highlight="password"
      subtitle="Enter your staff email and we will send you a reset link."
      footer={
        <Link to="/admin/login" className="inline-flex items-center gap-1 font-medium text-brand-500 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      }
    >
      <SEOHead title="Forgot password" noIndex />
      {sent ? (
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <MailCheck className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold">Check your inbox</h3>
          <p className="mt-2 text-sm text-muted">{sent}</p>
          <p className="mt-1 text-xs text-muted">Sent to {getValues('email')}. The link expires in 1 hour.</p>
          <Button variant="secondary" size="sm" className="mt-6" onClick={() => setSent(null)}>
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Email" type="email" autoComplete="email" placeholder="you@digrow.rw" error={errors.email?.message} {...register('email')} />
          <Button type="submit" className="w-full" loading={isSubmitting} icon={Send}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
