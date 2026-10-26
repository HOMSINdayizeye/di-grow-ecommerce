import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  Send,
  PhoneCall,
  Truck,
  MapPin,
  Clock,
  Wallet,
  Info,
  Stethoscope,
  Camera,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import SectionHeading from '@/components/common/SectionHeading';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useReveal } from '@/hooks/useReveal';
import { useSettings } from '@/hooks/useSettings';
import { whatsappLink } from '@/constants/site';
import { formatCurrency } from '@/utils/formatCurrency';

const STEPS = [
  {
    icon: ShoppingBag,
    title: 'Browse & add to cart',
    text: 'Explore supplements, personal care, pharmacist-verified medicines and farm inputs. Add what you need to your cart, prices are shown in RWF with no hidden fees.',
    tag: 'Takes 2 minutes',
  },
  {
    icon: Send,
    title: 'Send your order request',
    text: 'Tell us your name, phone number and delivery address, then submit. No account to create and no card details, your request simply reaches our team.',
    tag: 'No account, no card',
  },
  {
    icon: PhoneCall,
    title: 'We call to confirm',
    text: 'A team member calls or WhatsApps you to confirm items, total and delivery time. For prescription items you send a photo of the prescription on WhatsApp and our pharmacist checks it before dispatch.',
    tag: 'Usually within 2 hours',
  },
  {
    icon: Truck,
    title: 'Same-day delivery, pay on arrival',
    text: 'A rider brings your order anywhere in Kigali, usually the same day. Pay cash or mobile money (MTN MoMo / Airtel Money) when it reaches you.',
    tag: 'Cash or MoMo',
  },
];

const COVERAGE = ['Gasabo', 'Kicukiro', 'Nyarugenge'];
const CUTOFF = '3:00 PM';

const FAQ_TEASER = [
  { q: 'Do I need to create an account?', a: 'No. Just add items to your cart and send an order request with your phone number. We handle the rest by phone.' },
  { q: 'Can I pay online?', a: 'Not yet. You pay on delivery, with cash or mobile money, once the rider hands over your order.' },
  { q: 'What if an item is out of stock?', a: 'We tell you during the confirmation call and suggest an alternative or remove it from the order. Nothing is charged until delivery.' },
];

export default function HowItWorksPage() {
  const { settings } = useSettings();
  const ref = useReveal();

  return (
    <div ref={ref}>
      <SEOHead title="How It Works" description="Ordering from Di-Grow is simple: add to cart, send an order request, we call to confirm, then deliver the same day in Kigali. Pay on delivery with cash or mobile money." />

      <PageHero
        eyebrow="Simple ordering"
        title="How ordering"
        highlight="works"
        subtitle="No accounts, no online payment. Four easy steps from your first click to a knock on your door."
        breadcrumbs={[{ label: 'How It Works' }]}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Licensed pharmacist</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-success" /> Same-day in Kigali</span>
          <span className="inline-flex items-center gap-1.5"><Wallet className="h-4 w-4 text-success" /> Pay on delivery</span>
        </div>
      </PageHero>

      {/* Timeline */}
      <section className="relative overflow-hidden section">
        <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full glow-brand blur-3xl opacity-60" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full glow-accent blur-3xl opacity-60" />
        <div className="container relative">
          <SectionHeading eyebrow="Your journey" title="From cart to" highlight="your door" subtitle="Every request is confirmed by a real person before anything is dispatched." />

          <div className="relative mx-auto mt-14 max-w-5xl">
            {/* Spine */}
            <div className="pointer-events-none absolute left-6 top-0 h-full w-px bg-gradient-to-b from-brand-500 via-accent-500 to-brand-500 opacity-50 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />

            <ol className="space-y-10 md:space-y-16">
              {STEPS.map(({ icon: Icon, title, text, tag }, i) => {
                const left = i % 2 === 0;
                return (
                  <li key={title} className="relative md:grid md:grid-cols-2 md:gap-12">
                    {/* Marker */}
                    <div className="absolute left-6 top-6 z-10 -translate-x-1/2 md:left-1/2">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand font-display text-lg font-extrabold text-white shadow-glow ring-4 ring-bg">
                        {i + 1}
                      </span>
                    </div>

                    <div className={`pl-16 md:pl-0 ${left ? 'md:col-start-1 md:pr-14' : 'md:col-start-2 md:pl-14'}`}>
                      <div className="card card-hover reveal relative overflow-hidden p-6 md:p-8" style={{ transitionDelay: `${i * 90}ms` }}>
                        <div className={`pointer-events-none absolute -top-16 h-48 w-48 rounded-full blur-3xl ${left ? '-right-16 glow-brand' : '-left-16 glow-accent'}`} />
                        <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-ink/5">0{i + 1}</span>
                        <div className="relative">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-soft text-brand-500">
                            <Icon className="h-7 w-7" />
                          </div>
                          <span className="badge mt-5 bg-brand-500/10 text-brand-500">{tag}</span>
                          <h3 className="mt-3 font-display text-2xl font-bold">{title}</h3>
                          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{text}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Delivery details */}
      <section className="border-y border-line bg-surface-2/60">
        <div className="container section">
          <SectionHeading eyebrow="Delivery" title="Delivery" highlight="details" subtitle="We deliver across the three districts of Kigali City, by motorbike or car depending on the order." />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="card reveal p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-soft text-brand-500"><MapPin className="h-6 w-6" /></span>
              <h3 className="mt-4 font-display text-lg font-bold">Coverage</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-muted">
                {COVERAGE.map((d) => (
                  <li key={d} className="inline-flex w-full items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> {d} district</li>
                ))}
              </ul>
            </div>
            <div className="card reveal p-6" style={{ transitionDelay: '80ms' }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-soft text-accent-500"><Wallet className="h-6 w-6" /></span>
              <h3 className="mt-4 font-display text-lg font-bold">Delivery fee</h3>
              <p className="mt-3 font-display text-3xl font-extrabold text-gradient">{formatCurrency(settings.deliveryFee)}</p>
              <p className="mt-2 text-sm text-muted">Free on orders above <strong className="text-ink">{formatCurrency(settings.freeDeliveryThreshold)}</strong>.</p>
            </div>
            <div className="card reveal p-6" style={{ transitionDelay: '160ms' }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-soft text-brand-500"><Clock className="h-6 w-6" /></span>
              <h3 className="mt-4 font-display text-lg font-bold">Cut-off time</h3>
              <p className="mt-3 text-sm text-muted">Requests confirmed before <strong className="text-ink">{CUTOFF}</strong> are delivered the same day. Later requests go out first thing next morning.</p>
              <p className="mt-2 text-xs text-muted">Hours: {settings.openingHours}</p>
            </div>
            <div className="card reveal p-6" style={{ transitionDelay: '240ms' }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-soft text-accent-500"><Info className="h-6 w-6" /></span>
              <h3 className="mt-4 font-display text-lg font-bold">Good to know</h3>
              <p className="mt-3 text-sm text-muted">
                {settings.deliveryNote || 'Our rider calls when they are close. Please keep your phone on and have the exact amount or mobile money ready.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prescription explainer */}
      <section className="container section">
        <div className="reveal relative overflow-hidden rounded-xl3 border bg-surface p-8 shadow-soft md:p-12" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full glow-brand blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <span className="eyebrow">Pharmacy</span>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">Ordering <span className="text-gradient">prescription medicines</span></h2>
              <p className="mt-4 text-muted">Medicines marked with a prescription badge can only be dispensed after a licensed pharmacist has verified a valid prescription. Here is how it works when you request one.</p>
              <ul className="mt-6 space-y-4">
                {[
                  { icon: Camera, t: 'Send a photo of your prescription on WhatsApp when we call. A clear phone picture is enough.' },
                  { icon: Stethoscope, t: 'Our pharmacist checks the prescriber, dosage and possible interactions with other items in your order.' },
                  { icon: ShieldCheck, t: 'Once approved, the medicine is packed sealed and labelled. If something is unclear we call you before dispatch, never after.' },
                ].map(({ icon: Icon, t }) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-muted md:text-base">
                    <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-soft text-brand-500"><Icon className="h-4 w-4" /></span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to="/category/prescription-medicines" className="btn btn-primary btn-md mt-8">
                Browse medicines <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="lg:col-span-5">
              <div className="glass rounded-xl2 p-6 shadow-card">
                <p className="font-ui text-xs font-semibold uppercase tracking-wider text-muted">Please note</p>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li>• Prescriptions must be dated within the last 6 months.</li>
                  <li>• We cannot dispense without a prescription, even for refills.</li>
                  <li>• Controlled substances are not available online.</li>
                  <li>• Medicines cannot be returned once delivered.</li>
                </ul>
                <Link to="/faq" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-500">
                  Read the prescription FAQ <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="container section !pt-0">
        <SectionHeading eyebrow="Questions" title="Common" highlight="questions" />
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
            See all FAQs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-8">
        <div className="reveal relative overflow-hidden rounded-xl3 bg-gradient-hero p-8 text-center text-white md:p-14">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full glow-brand blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full glow-accent blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold text-balance md:text-5xl">Ready when you are</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">Start with the shop, or message us on WhatsApp and we will put the order together for you.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Shop products <ArrowRight className="h-5 w-5" />
              </Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
