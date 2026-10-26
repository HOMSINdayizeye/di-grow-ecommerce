import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ShieldCheck, Sprout, Truck, PackageCheck, Users, Leaf, Star, Heart } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import SectionHeading from '@/components/common/SectionHeading';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useReveal } from '@/hooks/useReveal';
import { whatsappLink } from '@/constants/site';

const VALUES = [
  { icon: BadgeCheck, title: 'Genuine products', text: 'Every item is sourced from licensed distributors and checked on arrival. If we would not give it to our own family, we do not sell it.', tone: 'brand' },
  { icon: ShieldCheck, title: 'Pharmacist verified', text: 'A licensed pharmacist reviews every prescription order and is available on WhatsApp for dosage and interaction questions.', tone: 'brand' },
  { icon: Sprout, title: 'Farmer first', text: 'Our agronomist tests the fertilizers and seeds we stock on real Rwandan plots, and shares what works for free.', tone: 'accent' },
  { icon: Truck, title: 'Kigali fast delivery', text: 'Same-day riders across Gasabo, Kicukiro and Nyarugenge. You pay when the order is in your hands, not before.', tone: 'accent' },
];

const NUMBERS = [
  { value: '2019', label: 'Serving Kigali since', icon: Heart },
  { value: '2,500+', label: 'Orders delivered', icon: PackageCheck },
  { value: '200+', label: 'Trusted products', icon: Leaf },
  { value: '4.8/5', label: 'Average customer rating', icon: Star },
];

const TEAM = [
  { name: 'Dr. Aline Uwase', role: 'Pharmacist', bio: 'Licensed by the Rwanda FDA, Aline verifies every prescription and writes most of our wellness articles.' },
  { name: 'Jean Bosco Habimana', role: 'Agronomist', bio: 'Jean Bosco grew up farming in Musanze and now advises cooperatives on foliar nutrition and soil health.' },
  { name: 'Grace Ingabire', role: 'Customer care', bio: 'Grace is the friendly voice that confirms your order, in Kinyarwanda, English or French.' },
];

const initials = (name) =>
  name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('');

export default function AboutPage() {
  const ref = useReveal();

  return (
    <div ref={ref}>
      <SEOHead title="About Us" description="Di-Grow is a Kigali shop for health supplements, personal care, pharmacist-verified medicines and organic farm inputs. Meet the team and learn what we stand for." />

      <PageHero
        eyebrow="Our story"
        title="Health and growth,"
        highlight="made in Kigali"
        subtitle="We started as a small pharmacy counter and a bag of foliar fertilizer. Today we help families stay healthy and farmers grow strong across the city."
        breadcrumbs={[{ label: 'About' }]}
      />

      {/* Story */}
      <section className="relative overflow-hidden section">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full glow-brand blur-3xl opacity-60" />
        <div className="container relative grid items-center gap-12 lg:grid-cols-12">
          <div className="reveal lg:col-span-6">
            <span className="eyebrow mb-4">Who we are</span>
            <h2 className="section-title">Rooted in care, <span className="text-gradient">grown with trust</span></h2>
            <div className="mt-6 space-y-4 text-muted md:text-lg">
              <p>Di-Grow began in 2019 in Nyarugenge, when a pharmacist and an agronomist noticed the same thing: people in Kigali were paying too much for products they could not fully trust, and spending half a day in traffic to collect them.</p>
              <p>So we built a simpler way. You request what you need online, a real person calls to confirm, and a rider brings it to your door the same day. No accounts, no card details, no surprises.</p>
              <p>Whether it is a vitamin for your child, a verified prescription for your parent or a litre of foliar fertilizer for your beans, the promise is the same: genuine products, honest prices and a team you can actually talk to.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn btn-primary btn-md">
                Browse the shop <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary btn-md">
                How ordering works
              </Link>
            </div>
          </div>

          <div className="reveal relative mx-auto w-full max-w-lg lg:col-span-6 lg:max-w-none" style={{ transitionDelay: '120ms' }}>
            <div className="relative aspect-[9/7] overflow-hidden rounded-xl3 border shadow-float" style={{ borderColor: 'var(--glass-border)' }}>
              <img src="https://picsum.photos/seed/digrow-about/900/700" alt="The Di-Grow team preparing orders in Kigali" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent" />
            </div>
            <div className="glass absolute -bottom-6 left-4 flex items-center gap-3 rounded-xl2 px-5 py-4 shadow-card animate-float sm:-left-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow"><Users className="h-5 w-5" /></span>
              <div>
                <p className="font-display text-xl font-bold leading-none text-ink">1,800+</p>
                <p className="mt-1 text-xs text-muted">Families & farms served</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & values */}
      <section className="border-y border-line bg-surface-2/60">
        <div className="container section">
          <SectionHeading eyebrow="Mission & values" title="What we" highlight="stand for" subtitle="Our mission is simple: make trusted health and farming products easy to get for every household in Kigali." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text, tone }, i) => (
              <div key={title} className="card card-hover reveal relative overflow-hidden p-6" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl ${tone === 'brand' ? 'glow-brand' : 'glow-accent'}`} />
                <div className="relative">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-soft ${tone === 'brand' ? 'text-brand-500' : 'text-accent-500'}`}>
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="container section">
        <div className="reveal relative overflow-hidden rounded-xl3 bg-gradient-hero p-8 text-white md:p-12">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full glow-brand blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full glow-accent blur-3xl" />
          <div className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
            {NUMBERS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="mx-auto h-6 w-6 text-accent-300" />
                <p className="mt-3 font-display text-3xl font-extrabold md:text-4xl lg:text-5xl">{value}</p>
                <p className="mt-1 text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container section !pt-0">
        <SectionHeading eyebrow="The team" title="People you can" highlight="talk to" subtitle="Small on purpose. The person who confirms your order is the same person who answers when you call back." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TEAM.map(({ name, role, bio }, i) => (
            <div key={name} className="card card-hover reveal p-6 text-center" style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand font-display text-2xl font-bold text-white shadow-glow">{initials(name)}</span>
              <h3 className="mt-5 font-display text-xl font-bold">{name}</h3>
              <p className="mt-1 font-ui text-xs font-semibold uppercase tracking-wider text-brand-500">{role}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-8">
        <div className="reveal relative overflow-hidden rounded-xl3 bg-gradient-hero p-8 text-center text-white md:p-14">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full glow-brand blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full glow-accent blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold text-balance md:text-5xl">Let us take care of the rest</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">Request an order online or say hello on WhatsApp. We confirm every request personally before delivery.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Start shopping <ArrowRight className="h-5 w-5" />
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
