import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Send, ArrowLeft } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import AuthShell from '@/components/admin/AuthShell';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { adminAuthService } from '@/services/adminAuthService';
import { getErrorMessage } from '@/services/api';
import { forgotPasswordSchema } from '@/validations/adminSchemas';

/** Step 1 of the reset: ask for the email, then send the user on to type the emailed code. */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    try {
      const res = await adminAuthService.forgotPassword(email);
      toast.success(res?.data?.message || 'If that email exists, a 5-digit code has been sent to it.');
      navigate('/admin/reset-password', { state: { email } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthShell
      title="Reset your"
      highlight="password"
      subtitle="Enter your staff email and we will send you a 5-digit code."
      footer={
        <span className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link to="/admin/login" className="inline-flex items-center gap-1 font-medium text-brand-500 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
          <Link to="/admin/reset-password" className="font-medium text-brand-500 hover:underline">
            I already have a code
          </Link>
        </span>
      }
    >
      <SEOHead title="Forgot password" noIndex />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email" type="email" autoComplete="email" placeholder="you@digrow.rw" error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" loading={isSubmitting} icon={Send}>
          Send code
        </Button>
      </form>
    </AuthShell>
  );
}
