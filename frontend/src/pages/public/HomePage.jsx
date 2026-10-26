import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  PhoneCall,
  Leaf,
  Star,
  ClipboardList,
  PackageCheck,
  Quote,
  BadgeCheck,
  Clock,
  Cross,
} from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import SectionHeading from '@/components/common/SectionHeading';
import ProductGrid from '@/components/product/ProductGrid';
import CategoryNav from '@/components/category/CategoryNav';
import PostCard from '@/components/blog/PostCard';
import { useCategories, useFeaturedProducts } from '@/hooks/useProducts';
import { useFetch } from '@/hooks/useFetch';
import { useReveal } from '@/hooks/useReveal';
import { blogService } from '@/services/blogService';
import { whatsappLink } from '@/constants/site';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';

const STATS = [
  { value: '2,500+', label: 'Orders delivered', icon: PackageCheck },
  { value: '200+', label: 'Trusted products', icon: Leaf },
  { value: '3', label: 'Kigali districts covered', icon: Truck },
  { value: '4.8', label: 'Average rating', icon: Star },
];

const STEPS = [
  { icon: ClipboardList, title: 'Add to cart & request', text: 'Pick what you need and send an order request with your phone number and address. No account, no online payment.' },
  { icon: PhoneCall, title: 'We call to confirm', text: 'Within a few hours a team member calls or WhatsApps you to confirm items, price and delivery time. Prescriptions are checked here.' },
  { icon: Truck, title: 'Delivered to your door', text: 'A rider brings your order anywhere in Kigali, usually the same day. Pay cash or mobile money on delivery.' },
];

const TESTIMONIALS = [
  { name: 'Aimable N.', place: 'Kimironko', text: 'I requested supplements for my mother at 10am and they were at her door by 3pm. The call to confirm made me trust the process.' },
  { name: 'Josiane M.', place: 'Kanombe', text: 'The pharmacist checked my prescription on WhatsApp before sending the medicine. Professional and fast.' },
  { name: 'Fabrice T.', place: 'Gahanga', text: 'Our cooperative orders foliar fertilizer every season. Genuine product, fair price, and they deliver straight to the farm.' },
];

const TRUST = ['Licensed pharmacist on staff', 'Genuine products only', 'Same-day Kigali delivery', 'Pay on delivery', 'WhatsApp support'];

function HeroStat({ value, label, icon: Icon, className, delay = 0 }) {
  return (
    <div className={`glass flex items-center gap-3 rounded-xl2 px-4 py-3 shadow-card animate-fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-soft text-brand-500">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-xl font-bold leading-none text-ink">{value}</p>
        <p className="mt-1 text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: categories, loading: catLoading } = useCategories();
  const { data: featured, loading: featLoading } = useFeaturedProducts(8);
  const { data: posts } = useFetch(() => blogService.list({ limit: 3 }), [], { initialData: [] });
  const ref = useReveal();

  return (
    <div ref={ref}>
      <SEOHead />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-70" />
        <div className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full glow-brand blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full glow-accent blur-3xl" />
        <div className="container relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-12 lg:py-28">
          <div className="text-center lg:col-span-7 lg:text-left">
            <span className="eyebrow mb-6 animate-fade-up">
              <Cross className="h-3.5 w-3.5 fill-current" /> Licensed pharmacy · Trusted by families and farmers in Kigali
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-balance animate-fade-up sm:text-5xl lg:text-6xl xl:text-7xl" style={{ animationDelay: '80ms' }}>
              Everything You Need to <span className="text-gradient">Stay Healthy</span> and Grow Strong
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted animate-fade-up md:text-lg lg:mx-0" style={{ animationDelay: '160ms' }}>
              Health supplements, personal care, pharmacist-verified medicines and organic farm inputs. Request your order online, we call to confirm, and deliver to your door the same day.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up lg:justify-start" style={{ animationDelay: '240ms' }}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Shop Products <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary btn-lg">
                How ordering works
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted animate-fade-up lg:justify-start" style={{ animationDelay: '320ms' }}>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Licensed pharmacist</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-success" /> Same-day delivery</span>
              <span className="inline-flex items-center gap-1.5"><PhoneCall className="h-4 w-4 text-success" /> Pay on delivery</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl3 border shadow-float" style={{ borderColor: 'var(--glass-border)' }}>
              <img src="https://picsum.photos/seed/digrow-hero/900/1100" alt="Di-Grow products ready for delivery in Kigali" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs uppercase tracking-wider text-white/70">Featured this week</p>
                <p className="font-display text-xl font-bold">Organic Foliar Fertilizer 1L</p>
                <Link to="/product/organic-foliar-fertilizer-1l" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-200">
                  View product <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <HeroStat value={STATS[0].value} label={STATS[0].label} icon={STATS[0].icon} className="absolute -left-6 top-8 hidden animate-float sm:flex" delay={300} />
            <HeroStat value={STATS[3].value} label={STATS[3].label} icon={STATS[3].icon} className="absolute -right-6 bottom-16 hidden animate-float sm:flex" delay={500} />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-gradient-brand text-white">
        <div className="container overflow-hidden py-3.5">
          <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap text-sm font-semibold">
            {[...TRUST, ...TRUST].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-white/90" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container section !pb-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <div key={label} className="card reveal p-6 text-center" style={{ transitionDelay: `${i * 80}ms` }}>
              <Icon className="mx-auto h-6 w-6 text-accent-500" />
              <p className="mt-3 font-display text-3xl font-extrabold text-gradient md:text-4xl">{value}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container section">
        <SectionHeading eyebrow="Browse by category" title="Shop What" highlight="Matters to You" subtitle="From daily vitamins to crop nutrition, every product is sourced from licensed suppliers and checked by our team." />
        <div className="mt-12">
          {catLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-40" />
              ))}
            </div>
          ) : (
            <CategoryNav categories={categories} />
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="relative overflow-hidden section">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full glow-brand blur-3xl opacity-50" />
        <div className="container relative">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading align="left" eyebrow="Featured" title="Popular" highlight="This Week" subtitle="Customer favourites across health, care and farming." />
            <Link to="/shop" className="btn btn-secondary btn-md reveal">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={featured} loading={featLoading} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container section">
        <SectionHeading eyebrow="Simple ordering" title="How" highlight="Di-Grow Works" subtitle="No accounts, no card details. Three steps from request to delivery." />
        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500 opacity-40 md:block" />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="card card-hover reveal relative p-6 text-center" style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="absolute left-5 top-5 font-display text-4xl font-extrabold text-ink/5">0{i + 1}</span>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/how-it-works" className="btn btn-ghost btn-md text-brand-500">
            Learn more about ordering <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Prescription + farmers split */}
      <section className="container section !pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card reveal relative overflow-hidden p-8 md:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full glow-brand blur-3xl" />
            <span className="eyebrow">Pharmacy</span>
            <h3 className="mt-4 font-display text-2xl font-bold md:text-3xl">Prescription medicines, verified by a pharmacist</h3>
            <p className="mt-3 text-muted">Order from home. Send a photo of your prescription when we call, and our licensed pharmacist checks dosage and interactions before anything is dispatched.</p>
            <Link to="/category/prescription-medicines" className="btn btn-primary btn-md mt-6">
              Browse medicines <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="card reveal relative overflow-hidden p-8 md:p-10" style={{ transitionDelay: '120ms' }}>
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full glow-accent blur-3xl" />
            <span className="eyebrow !border-accent-500/30 !bg-accent-500/10 !text-accent-500">For farmers</span>
            <h3 className="mt-4 font-display text-2xl font-bold md:text-3xl">Organic growth products that lift your yield</h3>
            <p className="mt-3 text-muted">Foliar fertilizers, soil conditioners, certified seeds and tools, delivered to your plot or cooperative with agronomist guidance on WhatsApp.</p>
            <Link to="/category/organic-fertilizers" className="btn btn-secondary btn-md mt-6">
              Explore farm inputs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container section">
        <SectionHeading eyebrow="Customer stories" title="Trusted Across" highlight="Kigali" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure key={t.name} className="card reveal relative p-6" style={{ transitionDelay: `${i * 100}ms` }}>
              <Quote className="absolute right-5 top-5 h-8 w-8 text-brand-500/20" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-gold-500 text-gold-500" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-muted">“{t.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand font-bold text-white">{t.name.charAt(0)}</span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted">{t.place}, Kigali</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Blog */}
      {posts?.length > 0 && (
        <section className="container section !pt-0">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading align="left" eyebrow="From the blog" title="Health & Farming" highlight="Tips" />
            <Link to="/blog" className="btn btn-secondary btn-md reveal">
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container pb-8">
        <div className="reveal relative overflow-hidden rounded-xl3 bg-gradient-hero p-8 text-center text-white md:p-14">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full glow-brand blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full glow-accent blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold text-balance md:text-5xl">Ready to place your first order?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">Browse the shop or message us on WhatsApp. A real person confirms every request before delivery.</p>
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
