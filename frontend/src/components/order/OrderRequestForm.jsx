import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Send, FileCheck2 } from 'lucide-react';
import FormField, { Checkbox } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { orderRequestSchema, normalisePhone } from '@/validations/orderRequestSchema';
import { KIGALI_DISTRICTS, getSectors } from '@/constants/districts';
import { getItem, setItem } from '@/utils/storage';

const REMEMBER_KEY = 'customer';

/**
 * Customer details for an order request. Calls onSubmit({ customer }) with a
 * normalised payload. Remembers details locally for next time.
 */
export default function OrderRequestForm({ onSubmit, submitting = false, hasPrescriptionItems = false, serverError }) {
  const remembered = getItem(REMEMBER_KEY, {});
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderRequestSchema),
    defaultValues: {
      name: remembered.name || '',
      phone: remembered.phone || '',
      email: remembered.email || '',
      district: remembered.district || '',
      sector: remembered.sector || '',
      address: remembered.address || '',
      notes: '',
      prescriptionAck: false,
      agree: false,
    },
  });

  const district = watch('district');
  const sectors = getSectors(district);

  const submit = (values) => {
    const customer = {
      name: values.name,
      phone: normalisePhone(values.phone),
      email: values.email || '',
      district: values.district,
      sector: values.sector,
      address: values.address,
      notes: values.notes || '',
    };
    setItem(REMEMBER_KEY, { name: customer.name, phone: values.phone, email: customer.email, district: customer.district, sector: customer.sector, address: customer.address });
    onSubmit({ customer });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8" noValidate>
      <section>
        <h3 className="font-display text-lg font-bold">Contact details</h3>
        <p className="mt-1 text-sm text-muted">We use these to call you and confirm your order. No account needed.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" required placeholder="e.g. Aline Uwase" error={errors.name?.message} autoComplete="name" {...register('name')} />
          <FormField label="Phone number" required type="tel" placeholder="078 123 4567" help="We will call or WhatsApp this number" error={errors.phone?.message} autoComplete="tel" {...register('phone')} />
          <FormField label="Email (optional)" type="email" placeholder="you@example.com" help="For an order confirmation and status updates" error={errors.email?.message} autoComplete="email" className="sm:col-span-2" {...register('email')} />
        </div>
      </section>

      <section>
        <h3 className="font-display text-lg font-bold">Delivery address</h3>
        <p className="mt-1 text-sm text-muted">We currently deliver within Kigali City.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField
            as="select"
            label="District"
            required
            error={errors.district?.message}
            {...register('district', { onChange: () => setValue('sector', '') })}
          >
            <option value="">Select district</option>
            {KIGALI_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </FormField>
          <FormField as="select" label="Sector" required error={errors.sector?.message} disabled={!district} {...register('sector')}>
            <option value="">{district ? 'Select sector' : 'Choose a district first'}</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </FormField>
          <FormField label="Street / landmark" required placeholder="e.g. KG 11 Ave, opposite Simba Supermarket" error={errors.address?.message} className="sm:col-span-2" {...register('address')} />
          <FormField as="textarea" label="Notes for our team (optional)" placeholder="Preferred delivery time, gate instructions, questions about a product…" error={errors.notes?.message} className="sm:col-span-2" {...register('notes')} />
        </div>
      </section>

      {hasPrescriptionItems && (
        <section className="rounded-xl2 border border-accent-500/30 bg-accent-500/10 p-4">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-500" />
            <div className="text-sm">
              <p className="font-semibold text-accent-500">Your cart includes prescription items</p>
              <p className="mt-1 text-muted">When we call, please send a clear photo of your prescription on WhatsApp. Our pharmacist verifies it before the order is confirmed.</p>
              <Checkbox className="mt-3" label="I have a valid prescription for these items" {...register('prescriptionAck')} />
            </div>
          </div>
        </section>
      )}

      <Checkbox
        label={
          <>
            I agree to the <Link to="/terms" className="text-brand-500 underline" target="_blank">terms of service</Link> and <Link to="/privacy-policy" className="text-brand-500 underline" target="_blank">privacy policy</Link>
          </>
        }
        error={errors.agree?.message}
        {...register('agree')}
      />

      {serverError && <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full" loading={submitting} icon={Send}>
        {submitting ? 'Sending your request…' : 'Send order request'}
      </Button>
      <p className="text-center text-xs text-muted">You will not be charged online. We confirm by phone before delivery.</p>
    </form>
  );
}
