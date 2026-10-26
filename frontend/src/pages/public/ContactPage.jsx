import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Phone, Mail, MapPin, Clock, Send, ArrowRight, HelpCircle } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import SectionHeading from '@/components/common/SectionHeading';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useReveal } from '@/hooks/useReveal';
import { useSettings } from '@/hooks/useSettings';
import { contactSchema } from '@/validations/adminSchemas';

const SUBJECTS = ['Order question', 'Product availability', 'Prescription question', 'Farming advice', 'Other'];

const FAQ_TEASER = [
  { q: 'How fast do you reply?', a: 'WhatsApp and phone calls are answered during opening hours, usually within minutes. Emails get a reply within one working day.' },
  { q: 'Can I change an order after I submit it?', a: 'Yes. Tell us during the confirmation call, or message us on WhatsApp with your order number before the rider leaves.' },
  { q: 'Do you deliver outside Kigali?', a: 'Not at the moment. We cover Gasabo, Kicukiro and Nyarugenge. Contact us for larger farm orders upcountry and we will see what is possible.' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function ContactPage() {
  const { settings } = useSettings();
  const ref = useReveal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const onSubmit = async () => {
    await sleep(800);
    toast.success('Message sent, we will reply within one working day');
    reset();
  };

  const telHref = `tel:${String(settings.phone || '').replace(/[^\d+]/g, '')}`;
  const waHref = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Hello ${settings.storeName}, I have a question.`)}`;

  const CARDS = [
    { icon: Phone, label: 'Call us', value: settings.phone, href: telHref, hint: 'Mon to Sat, during opening hours' },
    { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}`, hint: 'Reply within one working day' },
    { icon: MapPin, label: 'Visit us', value: settings.address, hint: 'Kigali, Rwanda' },
    { icon: Clock, label: 'Opening hours', value: settings.openingHours, hint: 'Closed on public holidays' },
  ];

  return (
    <div ref={ref}>
      <SEOHead title="Contact Us" description="Call, WhatsApp or email the Di-Grow team in Kigali. Questions about orders, product availability, prescriptions or farming advice are welcome." />

      <PageHero
        eyebrow="Get in touch"
        title="We are here"
        highlight="to help"
        subtitle="Real people, real answers. Call, WhatsApp or send a message and a team member will get back to you."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="relative overflow-hidden section">
        <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full glow-accent blur-3xl opacity-60" />
        <div className="container relative grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Contact cards */}
          <div className="lg:col-span-5">
            <div className="reveal">
              <span className="eyebrow mb-4">Contact details</span>
              <h2 className="section-title">Talk to <span className="text-gradient">Di-Grow</span></h2>
              <p className="mt-4 text-muted">The fastest way to reach us is WhatsApp. For prescription questions you can send a photo of your prescription straight away.</p>
            </div>

            <a href={waHref} target="_blank" rel="noopener noreferrer" className="reveal mt-8 flex items-center gap-4 rounded-xl2 bg-[#25d366] p-5 text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-float">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20"><WhatsAppIcon className="h-6 w-6" /></span>
              <span>
                <span className="block font-display text-lg font-bold">Chat on WhatsApp</span>
                <span className="block text-sm text-white/85">+{settings.whatsapp}</span>
              </span>
              <ArrowRight className="ml-auto h-5 w-5" />
            </a>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {CARDS.map(({ icon: Icon, label, value, href, hint }, i) => {
                const inner = (
                  <>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-soft text-brand-500"><Icon className="h-5 w-5" /></span>
                    <p className="mt-4 font-ui text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
                    <p className="mt-1 break-words font-semibold text-ink">{value}</p>
                    <p className="mt-1 text-xs text-muted">{hint}</p>
                  </>
                );
                const cls = 'card card-hover reveal block p-5';
                const style = { transitionDelay: `${i * 80}ms` };
                return href ? (
                  <a key={label} href={href} className={cls} style={style}>
                    {inner}
                  </a>
                ) : (
                  <div key={label} className={cls} style={style}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="card reveal relative overflow-hidden p-6 md:p-8" style={{ transitionDelay: '120ms' }}>
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full glow-brand blur-3xl" />
              <div className="relative">
                <h2 className="font-display text-2xl font-bold">Send us a message</h2>
                <p className="mt-1 text-sm text-muted">Fill in the form and we will reply by email within one working day.</p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
                  <FormField label="Your name" required placeholder="e.g. Aimable Nkurunziza" autoComplete="name" error={errors.name?.message} {...register('name')} />
                  <FormField label="Email" required type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
                  <FormField as="select" label="Subject" required className="sm:col-span-2" error={errors.subject?.message} {...register('subject')}>
                    <option value="">Choose a subject</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </FormField>
                  <FormField
                    as="textarea"
                    rows={5}
                    label="Message"
                    required
                    className="sm:col-span-2"
                    placeholder="How can we help? If it is about an order, include your order number (DG-…)."
                    help="Please do not include passwords or payment details."
                    error={errors.message?.message}
                    {...register('message')}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
                    <p className="text-xs text-muted">By sending, you agree to our <Link to="/privacy-policy" className="text-brand-500 hover:underline">privacy policy</Link>.</p>
                    <Button type="submit" loading={isSubmitting} iconRight={Send} size="lg">
                      {isSubmitting ? 'Sending…' : 'Send message'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="container pb-16 md:pb-24">
        <div className="reveal relative overflow-hidden rounded-xl3 border bg-gradient-hero text-white shadow-card" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full glow-brand blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full glow-accent blur-3xl" />
          {/* Concentric rings suggesting a map pin location */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {[14, 24, 34].map((s) => (
              <span key={s} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" style={{ width: `${s}rem`, height: `${s}rem` }} />
            ))}
          </div>
          <div className="relative flex min-h-[18rem] flex-col items-center justify-center gap-6 p-8 text-center md:min-h-[22rem] md:flex-row md:gap-10 md:text-left">
            <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-brand shadow-glow animate-float">
              <MapPin className="h-9 w-9" />
            </span>
            <div>
              <p className="font-ui text-xs font-semibold uppercase tracking-wider text-white/60">Find us</p>
              <p className="mt-2 font-display text-2xl font-bold md:text-3xl">{settings.address}</p>
              <p className="mt-2 max-w-md text-sm text-white/70">Walk-ins are welcome during opening hours. Ask the rider or call us if you need directions.</p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Kigali')}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm mt-5 !border-white/20 !bg-white/10 !text-white hover:!bg-white/20">
                Open in Google Maps <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="border-t border-line bg-surface-2/60">
        <div className="container section">
          <SectionHeading eyebrow="Before you write" title="Quick" highlight="answers" />
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {FAQ_TEASER.map(({ q, a }, i) => (
              <div key={q} className="card reveal flex gap-4 p-5 md:p-6" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-soft text-brand-500"><HelpCircle className="h-4 w-4" /></span>
                <div>
                  <h3 className="font-display text-lg font-bold">{q}</h3>
                  <p className="mt-1.5 text-sm text-muted">{a}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/faq" className="btn btn-ghost btn-md text-brand-500">
              Browse all FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
