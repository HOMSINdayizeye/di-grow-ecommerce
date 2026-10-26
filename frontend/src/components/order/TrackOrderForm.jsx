import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { trackOrderSchema } from '@/validations/trackOrderSchema';

export default function TrackOrderForm({ onSubmit, loading = false, defaultValues = {}, className }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(trackOrderSchema), defaultValues: { orderNumber: '', phone: '', ...defaultValues } });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Order number" placeholder="DG-20260101-1001" required error={errors.orderNumber?.message} {...register('orderNumber')} autoComplete="off" />
        <FormField label="Phone number used on the order" placeholder="078 123 4567" type="tel" required error={errors.phone?.message} {...register('phone')} autoComplete="tel" />
      </div>
      <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto" loading={loading} icon={Search}>
        Track order
      </Button>
    </form>
  );
}
