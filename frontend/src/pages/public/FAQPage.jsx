import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import clsx from 'clsx';
import { Search, X, ChevronDown, SearchX, ShoppingBag, Truck, Stethoscope, Sprout, Wallet, ArrowRight } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import EmptyState from '@/components/common/EmptyState';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useReveal } from '@/hooks/useReveal';
import { whatsappLink } from '@/constants/site';

const GROUPS = [
  {
    id: 'ordering',
    title: 'Ordering',
    icon: ShoppingBag,
    items: [
      { q: 'Do I need an account to order?', a: 'No. Add products to your cart, enter your name, phone number and delivery address, and submit the order request. That is it.' },
      { q: 'What happens after I submit an order request?', a: 'A team member calls or WhatsApps you, usually within two hours during opening hours, to confirm the items, the total in RWF and a delivery time. Your request is only final after this call.' },
      { q: 'Can I order by WhatsApp or phone instead?', a: 'Yes. Send us a message or call during opening hours and we will create the order for you. The website is simply the quickest way to see prices and stock.' },
      { q: 'Is there a minimum order?', a: 'There is no minimum. Small orders pay the standard delivery fee; orders above the free-delivery threshold are delivered free.' },
      { q: 'How do I track my order?', a: 'Use the Track Order page with your order number (DG-…) and the phone number you ordered with. You will also get a call from the rider when they are close.' },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery',
    icon: Truck,
    items: [
      { q: 'Where do you deliver?', a: 'Anywhere in Kigali City: Gasabo, Kicukiro and Nyarugenge districts. We do not deliver upcountry yet, but contact us for large farm orders and we will try to help.' },
      { q: 'How long does delivery take?', a: 'Orders confirmed before 3:00 PM are delivered the same day. Later orders go out first thing the next morning. Prescription orders may take a little longer while the pharmacist verifies them.' },
      { q: 'How much is delivery?', a: 'A flat fee per order, shown on the How It Works page and in your cart. Delivery is free above the threshold shown at checkout.' },
      { q: 'What if I am not home when the rider arrives?', a: 'The rider calls when they are close. If you cannot be reached, we hold the order and try again later the same day or the next morning, at no extra charge for the first retry.' },
    ],
  },
  {
    id: 'prescriptions',
    title: 'Prescriptions',
    icon: Stethoscope,
    items: [
      { q: 'How do I order a prescription medicine?', a: 'Add it to your cart like any other product. When we call to confirm, send a clear photo of your prescription on WhatsApp. Our licensed pharmacist verifies it before the medicine is dispatched.' },
      { q: 'What makes a prescription valid?', a: 'It must be issued by a licensed prescriber, show the patient name, the medicine, dose and quantity, and be dated within the last six months.' },
      { q: 'Can you refill a prescription without a new one?', a: 'Only if the original prescription allows repeats and is still within its validity. Otherwise we will ask you to see your doctor; we never dispense without a valid prescription.' },
      { q: 'Can the pharmacist advise me on dosage or interactions?', a: 'Yes, free of charge. Message us on WhatsApp with the medicines you take and any questions, and our pharmacist will reply during opening hours.' },
    ],
  },
  {
    id: 'farm',
    title: 'Farm products',
    icon: Sprout,
    items: [
      { q: 'Are your fertilizers organic and certified?', a: 'Our foliar fertilizers and soil conditioners are organic, sourced from registered suppliers and tested by our agronomist on local plots before we list them.' },
      { q: 'Do you give advice on how to use them?', a: 'Yes. Every farm product page has dilution and timing notes, and our agronomist is available on WhatsApp for crop-specific questions.' },
      { q: 'Can cooperatives place bulk orders?', a: 'Absolutely. Contact us with the quantities you need and we will quote a cooperative price and arrange delivery to your plot or store.' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & returns',
    icon: Wallet,
    items: [
      { q: 'How do I pay?', a: 'On delivery, with cash or mobile money (MTN MoMo or Airtel Money). We do not take card or online payments, and we never ask for payment before the order reaches you.' },
      { q: 'Can I return a product?', a: 'Unopened, non-medicine products can be returned within 48 hours of delivery if they are damaged or not what you ordered. Medicines and opened personal-care items cannot be returned for safety reasons.' },
      { q: 'How do I cancel an order?', a: 'Tell us during the confirmation call, or message us on WhatsApp with your order number before the rider leaves. There is no charge for cancelling before dispatch.' },
    ],
  },
];

function AccordionItem({ item, open, onToggle, id }) {
  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-card">
      <h3>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-bold text-ink md:px-6 md:text-lg"
        >
          <span>{item.q}</span>
          <span className={clsx('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-soft text-brand-500 transition-transform duration-300', open && 'rotate-180')}>
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-muted md:px-6 md:text-base">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState('ordering-0');
  const ref = useReveal();

  const term = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return GROUPS;
    return GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.q.toLowerCase().includes(term) || i.a.toLowerCase().includes(term)) })).filter((g) => g.items.length);
  }, [term]);

  const totalMatches = filtered.reduce((n, g) => n + g.items.length, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap((g) =>
      g.items.map((i) => ({
        '@type': 'Question',
        name: i.q,
        acceptedAnswer: { '@type': 'Answer', text: i.a },
      }))
    ),
  };

  return (
    <div ref={ref}>
      <SEOHead title="FAQ" description="Answers to common questions about ordering from Di-Grow: delivery in Kigali, prescription verification, farm products, pay-on-delivery and returns." />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <PageHero
        eyebrow="Help centre"
        title="Frequently asked"
        highlight="questions"
        subtitle="Everything about ordering, delivery, prescriptions and payment. Can't find it? Message us on WhatsApp."
        breadcrumbs={[{ label: 'FAQ' }]}
      >
        <label className="relative block max-w-xl">
          <span className="sr-only">Search questions</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, e.g. delivery, prescription…"
            className="input !rounded-pill !py-3.5 !pl-12 !pr-12 text-ink"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </PageHero>

      <section className="relative overflow-hidden section">
        <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full glow-brand blur-3xl opacity-50" />
        <div className="container relative grid gap-10 lg:grid-cols-12">
          {/* Section nav */}
          <aside className="lg:col-span-3">
            <nav aria-label="FAQ sections" className="reveal lg:sticky lg:top-28">
              <p className="font-ui text-xs font-semibold uppercase tracking-wider text-muted">Sections</p>
              <ul className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin lg:flex-col lg:overflow-visible lg:pb-0">
                {GROUPS.map(({ id, title, icon: Icon, items }) => (
                  <li key={id} className="flex-shrink-0">
                    <a href={`#${id}`} className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 text-sm font-medium text-muted transition hover:text-ink hover:bg-surface-2 lg:w-full">
                      <Icon className="h-4 w-4 text-brand-500" /> {title}
                      <span className="ml-auto text-xs text-muted/70">{items.length}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Groups */}
          <div className="min-w-0 lg:col-span-9">
            {term && (
              <p className="mb-6 text-sm text-muted" aria-live="polite">
                {totalMatches} match{totalMatches === 1 ? '' : 'es'} for “<span className="font-semibold text-ink">{query.trim()}</span>”
              </p>
            )}

            {filtered.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No matches"
                description="Try a different word, or ask us directly on WhatsApp and we will answer right away."
                action={
                  <div className="flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => setQuery('')} className="btn btn-secondary btn-md">
                      Clear search
                    </button>
                    <a href={whatsappLink(`Hello, I have a question: ${query.trim()}`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-md">
                      <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
                    </a>
                  </div>
                }
              />
            ) : (
              <div className="space-y-12">
                {filtered.map(({ id, title, icon: Icon, items }) => (
                  <section key={id} id={id} className="scroll-mt-28">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow"><Icon className="h-5 w-5" /></span>
                      <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
                    </div>
                    <div className="mt-5 space-y-3">
                      {items.map((item) => {
                        const key = `${id}-${GROUPS.find((g) => g.id === id).items.indexOf(item)}`;
                        return <AccordionItem key={key} id={key} item={item} open={open === key} onToggle={() => setOpen(open === key ? null : key)} />;
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-8">
        <div className="reveal relative overflow-hidden rounded-xl3 bg-gradient-hero p-8 text-center text-white md:p-14">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full glow-brand blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full glow-accent blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold text-balance md:text-5xl">Still have questions?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">Our team answers on WhatsApp during opening hours, or send a message through the contact page.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
              </a>
              <Link to="/contact" className="btn btn-secondary btn-lg !border-white/20 !bg-white/10 !text-white hover:!bg-white/20">
                Contact us <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
