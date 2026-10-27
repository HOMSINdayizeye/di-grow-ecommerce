import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Store, Truck, Megaphone, Bell, Share2, Lock, Save, KeyRound } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import ErrorState from '@/components/admin/ErrorState';
import FormField, { Switch } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { Skeleton } from '@/components/common/Loader';
import { useFetch } from '@/hooks/useFetch';
import { settingsService } from '@/services/settingsService';
import { adminAuthService } from '@/services/adminAuthService';
import { getErrorMessage } from '@/services/api';
import { settingsSchema, changePasswordSchema } from '@/validations/adminSchemas';

const TABS = [
  { id: 'store', label: 'Store', icon: Store },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'announcement', label: 'Announcement', icon: Megaphone },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'social', label: 'Social & SEO', icon: Share2 },
  { id: 'security', label: 'Security', icon: Lock },
];

const DEFAULTS = {
  storeName: '',
  tagline: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  openingHours: '',
  deliveryFee: 0,
  freeDeliveryThreshold: 0,
  deliveryNote: '',
  announcement: '',
  announcementEnabled: false,
  notifyEmail: true,
  notifySms: true,
  notifyEmailRecipients: '',
  notifySmsRecipients: '',
  socialFacebook: '',
  socialInstagram: '',
  socialTwitter: '',
  seoTitle: '',
  seoDescription: '',
};

function Section({ title, description, children }) {
  return (
    <div className="card p-5 md:p-6">
      <h3 className="font-ui text-sm font-semibold">{title}</h3>
      {description && <p className="mb-5 mt-1 text-xs text-muted">{description}</p>}
      <div className={clsx('space-y-4', !description && 'mt-4')}>{children}</div>
    </div>
  );
}

function SecurityTab() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      const res = await adminAuthService.changePassword(currentPassword, newPassword);
      toast.success(res?.data?.message || 'Password changed');
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Section title="Change password" description="Use at least 8 characters. You stay signed in on this device.">
        <FormField label="Current password" required type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="New password" required type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
          <FormField label="Confirm new password" required type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" icon={KeyRound} loading={isSubmitting}>
            Update password
          </Button>
        </div>
      </Section>
    </form>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState('store');
  const { data: settings, loading, error, refetch, setData } = useFetch(() => settingsService.get(), []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(settingsSchema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (settings) reset({ ...DEFAULTS, ...settings });
  }, [settings, reset]);

  const seoTitle = watch('seoTitle') || '';
  const seoDescription = watch('seoDescription') || '';
  const announcementEnabled = watch('announcementEnabled');

  const onSubmit = async (values) => {
    try {
      const res = await settingsService.update(values);
      setData(res.data);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onInvalid = (errs) => {
    // Jump to the first tab that has an error so the message is visible.
    const fieldTabs = {
      store: ['storeName', 'tagline', 'phone', 'whatsapp', 'email', 'address', 'openingHours'],
      delivery: ['deliveryFee', 'freeDeliveryThreshold', 'deliveryNote'],
      announcement: ['announcement', 'announcementEnabled'],
      notifications: ['notifyEmail', 'notifySms', 'notifyEmailRecipients', 'notifySmsRecipients'],
      social: ['socialFacebook', 'socialInstagram', 'socialTwitter', 'seoTitle', 'seoDescription'],
    };
    const first = Object.keys(errs)[0];
    const target = Object.entries(fieldTabs).find(([, fields]) => fields.includes(first))?.[0];
    if (target) setTab(target);
    toast.error('Please fix the highlighted fields');
  };

  const switchField = (name, label, description, extra = {}) => (
    <Controller key={name} name={name} control={control} render={({ field }) => <Switch label={label} description={description} checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} {...extra} />} />
  );

  return (
    <div>
      <SEOHead title="Settings" noIndex />
      <PageHeader
        title="Store"
        highlight="settings"
        subtitle="Contact details, delivery pricing and what customers see on the site."
        actions={
          tab !== 'security' && (
            <Button type="submit" form="settings-form" size="sm" icon={Save} loading={isSubmitting} disabled={!settings || !isDirty}>
              Save changes
            </Button>
          )
        }
      />

      <div className="-mx-4 mb-6 overflow-x-auto px-4 scrollbar-thin md:mx-0 md:px-0">
        <div className="inline-flex min-w-full gap-1 rounded-pill bg-surface-2 p-1 md:min-w-0" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={clsx('flex items-center gap-1.5 whitespace-nowrap rounded-pill px-4 py-2 font-ui text-xs font-semibold transition', tab === t.id ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink')}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'security' ? (
        <div className="max-w-2xl">
          <SecurityTab />
        </div>
      ) : error ? (
        <div className="card">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : loading && !settings ? (
        <Skeleton className="h-96 max-w-3xl" />
      ) : (
        <form id="settings-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="max-w-3xl space-y-6" noValidate>
          {/* Keep every tab mounted so values persist; only the active one is visible. */}
          <div hidden={tab !== 'store'}>
            <Section title="Store details" description="Shown in the header, footer and contact page.">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Store name" required error={errors.storeName?.message} {...register('storeName')} />
                <FormField label="Tagline" error={errors.tagline?.message} {...register('tagline')} />
                <FormField label="Phone" required placeholder="+250 790 911 427" error={errors.phone?.message} {...register('phone')} />
                <FormField label="WhatsApp number" required placeholder="250790911427" help="Digits only, with country code" error={errors.whatsapp?.message} {...register('whatsapp')} />
                <FormField label="Email" required type="email" error={errors.email?.message} {...register('email')} />
                <FormField label="Opening hours" placeholder="Mon - Sat, 8:00 AM - 7:00 PM" error={errors.openingHours?.message} {...register('openingHours')} />
                <FormField className="sm:col-span-2" label="Address" placeholder="KN 4 Ave, Nyarugenge, Kigali" error={errors.address?.message} {...register('address')} />
              </div>
            </Section>
          </div>

          <div hidden={tab !== 'delivery'}>
            <Section title="Delivery" description="Applied automatically when a customer sends an order request.">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Delivery fee (RWF)" required type="number" min="0" step="1" inputMode="numeric" error={errors.deliveryFee?.message} {...register('deliveryFee')} />
                <FormField label="Free delivery from (RWF)" required type="number" min="0" step="1" inputMode="numeric" help="Set 0 to never offer free delivery" error={errors.freeDeliveryThreshold?.message} {...register('freeDeliveryThreshold')} />
              </div>
              <FormField as="textarea" label="Delivery note" rows={3} placeholder="e.g. Same-day delivery within Kigali for orders confirmed before 3:00 PM." error={errors.deliveryNote?.message} {...register('deliveryNote')} />
            </Section>
          </div>

          <div hidden={tab !== 'announcement'}>
            <Section title="Announcement bar" description="A short message shown at the top of every public page.">
              {switchField('announcementEnabled', 'Show announcement', 'Turn the bar on or off without losing the text')}
              <FormField as="textarea" label="Announcement text" rows={2} maxLength={160} placeholder="Free delivery on orders above RWF 50,000 within Kigali." error={errors.announcement?.message} disabled={!announcementEnabled} {...register('announcement')} />
            </Section>
          </div>

          <div hidden={tab !== 'notifications'}>
            <Section title="Order notifications" description="Who gets told when a new order request arrives.">
              {switchField('notifyEmail', 'Email alerts', 'Send an email for every new order')}
              <FormField label="Email recipients" placeholder="orders@digrow.rw, manager@digrow.rw" help="Comma separated" error={errors.notifyEmailRecipients?.message} {...register('notifyEmailRecipients')} />
              <div className="divider-gradient opacity-40" />
              {switchField('notifySms', 'SMS alerts', 'Send an SMS for every new order')}
              <FormField label="SMS recipients" placeholder="+250790911427, +250790911427" help="Comma separated, with country code" error={errors.notifySmsRecipients?.message} {...register('notifySmsRecipients')} />
            </Section>
          </div>

          <div hidden={tab !== 'social'} className="space-y-6">
            <Section title="Social links" description="Shown in the footer. Leave blank to hide.">
              <FormField label="Facebook" type="url" placeholder="https://facebook.com/digrow" error={errors.socialFacebook?.message} {...register('socialFacebook')} />
              <FormField label="Instagram" type="url" placeholder="https://instagram.com/digrow" error={errors.socialInstagram?.message} {...register('socialInstagram')} />
              <FormField label="X / Twitter" type="url" placeholder="https://x.com/digrow" error={errors.socialTwitter?.message} {...register('socialTwitter')} />
            </Section>
            <Section title="Search engine listing" description="How the home page appears on Google.">
              <FormField label="SEO title" maxLength={70} help={`${seoTitle.length}/70 characters`} error={errors.seoTitle?.message} {...register('seoTitle')} />
              <FormField as="textarea" label="SEO description" rows={3} maxLength={160} help={`${seoDescription.length}/160 characters`} error={errors.seoDescription?.message} {...register('seoDescription')} />
              <div className="rounded-xl border border-line bg-surface-2/60 p-4">
                <p className="text-xs text-muted">Preview</p>
                <p className="mt-1 truncate font-medium text-brand-500">{seoTitle || 'Di-Grow'}</p>
                <p className="line-clamp-2 text-sm text-muted">{seoDescription || 'Your description will appear here.'}</p>
              </div>
            </Section>
          </div>

          <div className="flex justify-end">
            <Button type="submit" icon={Save} loading={isSubmitting} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
