import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { CalendarDays, Scale, PhoneCall } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import { useReveal } from '@/hooks/useReveal';
import { useSettings } from '@/hooks/useSettings';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';

const LAST_UPDATED = '2026-10-01';

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const IDS = ['about', 'order-requests', 'pricing', 'delivery', 'payment', 'prescriptions', 'returns', 'cancellations', 'product-info', 'acceptable-use', 'liability', 'privacy', 'changes', 'governing-law', 'contact'];

const TOC = [
  ['about', '1. About these terms'],
  ['order-requests', '2. Order requests'],
  ['pricing', '3. Prices and currency'],
  ['delivery', '4. Delivery'],
  ['payment', '5. Payment on delivery'],
  ['prescriptions', '6. Prescription medicines'],
  ['returns', '7. Returns and refunds'],
  ['cancellations', '8. Cancellations'],
  ['product-info', '9. Product information'],
  ['acceptable-use', '10. Using the website'],
  ['liability', '11. Our liability'],
  ['privacy', '12. Privacy'],
  ['changes', '13. Changes to these terms'],
  ['governing-law', '14. Governing law'],
  ['contact', '15. Contact'],
];

export default function TermsPage() {
  const { settings } = useSettings();
  const ref = useReveal();
  const active = useActiveSection(IDS);

  return (
    <div ref={ref}>
      <SEOHead title="Terms of Service" description="The terms that apply when you request an order from Di-Grow in Kigali: confirmation by phone, RWF pricing, delivery area, prescriptions, returns and cancellations." />

      <PageHero eyebrow="Legal" title="Terms of" highlight="Service" subtitle="The simple rules that apply when you request an order from Di-Grow." breadcrumbs={[{ label: 'Terms of Service' }]}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-accent-300" /> Last updated {formatDate(LAST_UPDATED, { month: 'long' })}</span>
          <span className="inline-flex items-center gap-1.5"><PhoneCall className="h-4 w-4 text-success" /> Orders are confirmed by phone</span>
          <span className="inline-flex items-center gap-1.5"><Scale className="h-4 w-4 text-success" /> Governed by the laws of Rwanda</span>
        </div>
      </PageHero>

      <section className="container section">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* TOC */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <nav aria-label="Table of contents" className="card reveal p-5 lg:sticky lg:top-28">
              <p className="font-ui text-xs font-semibold uppercase tracking-wider text-muted">On this page</p>
              <ol className="mt-3 space-y-1">
                {TOC.map(([id, title]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={active === id ? 'location' : undefined}
                      className={clsx(
                        'block rounded-lg border-l-2 py-1.5 pl-3 pr-2 text-sm transition',
                        active === id ? 'border-brand-500 font-semibold text-brand-500' : 'border-transparent text-muted hover:text-ink'
                      )}
                    >
                      {title}
                    </a>
                  </li>
                ))}
              </ol>
              <Link to="/privacy-policy" className="mt-5 block text-sm font-semibold text-brand-500 hover:underline">
                See also: Privacy Policy →
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <div className="prose-dg min-w-0 lg:col-span-8 xl:col-span-9">
            <p className="reveal text-lg">
              Welcome to <strong>{settings.storeName}</strong>. By browsing this website or sending us an order request you agree to the terms below. They are written in plain language; if anything is unclear, call us before you order.
            </p>

            <section id="about" className="scroll-mt-28">
              <h2>1. About these terms</h2>
              <p>These terms govern the use of the Di-Grow website and the purchase of products from Di-Grow, a shop registered in Kigali, Rwanda (“we”, “us”). They apply to every order request, whether placed through the website, by phone or on WhatsApp.</p>
              <p>You must be at least 18 years old, or ordering with the consent of a parent or guardian, to request an order.</p>
            </section>

            <section id="order-requests" className="scroll-mt-28">
              <h2>2. Order requests</h2>
              <p>Our website does not take payment and does not create a binding sale by itself. When you submit an order request you are asking us to prepare and deliver the listed products.</p>
              <ul>
                <li><strong>An order request is not binding on either party until we confirm it by phone or WhatsApp.</strong> During that call we confirm the items, their availability, the total in RWF and a delivery time.</li>
                <li>We may decline or adjust a request, for example if a product is out of stock, the delivery address is outside our area, a prescription cannot be verified, or the request appears fraudulent. We will always tell you why.</li>
                <li>Once confirmed, the order becomes a contract to deliver the agreed products at the agreed price, payable on delivery.</li>
                <li>You are responsible for providing an accurate name, phone number and delivery address. If we cannot reach you on the number provided within 24 hours, the request is treated as withdrawn.</li>
              </ul>
            </section>

            <section id="pricing" className="scroll-mt-28">
              <h2>3. Prices and currency</h2>
              <p>All prices are shown in <strong>Rwandan Francs (RWF)</strong> and include VAT where applicable. The delivery fee is shown separately in the cart and on the How It Works page.</p>
              <p>We do our best to keep prices accurate, but errors can happen. If a price on the website is wrong, we will tell you the correct price during the confirmation call and you may accept it or cancel at no cost. The price confirmed on the call is the price you pay.</p>
            </section>

            <section id="delivery" className="scroll-mt-28">
              <h2>4. Delivery</h2>
              <ul>
                <li>We deliver within Kigali City: <strong>Gasabo, Kicukiro and Nyarugenge</strong> districts. Requests from outside this area may be declined or quoted separately.</li>
                <li>Orders confirmed before 3:00 PM are normally delivered the same day; later orders are delivered the next working day. Delivery times are estimates, not guarantees, and may be affected by traffic, weather or prescription verification.</li>
                <li>The delivery fee is currently <strong>{formatCurrency(settings.deliveryFee)}</strong> per order, and free for orders of <strong>{formatCurrency(settings.freeDeliveryThreshold)}</strong> or more. Fees may change; the fee confirmed on the call applies.</li>
                <li>The rider will call when they are close. If nobody is available to receive and pay for the order after reasonable attempts, we may return the goods to the shop and re-attempt delivery once; further attempts may incur a new delivery fee.</li>
                <li>Please check the order when it arrives. Ownership and risk pass to you once you accept the goods and pay.</li>
              </ul>
            </section>

            <section id="payment" className="scroll-mt-28">
              <h2>5. Payment on delivery</h2>
              <p>We accept <strong>cash</strong> or <strong>mobile money</strong> (MTN MoMo, Airtel Money) at the time of delivery. We do not accept card payments and we will never ask you to pay online or in advance. If someone asks you to pay before delivery while claiming to be Di-Grow, do not pay and contact us immediately.</p>
              <p>A receipt is provided with every delivery. Mobile-money transaction fees, if any, are borne by the customer.</p>
            </section>

            <section id="prescriptions" className="scroll-mt-28">
              <h2>6. Prescription medicines</h2>
              <ul>
                <li>Products marked as prescription-only are dispensed only after our licensed pharmacist has verified a valid prescription issued by a licensed prescriber, dated within the last six months.</li>
                <li>You must send a clear photo of the prescription when we call, or present the original on delivery if asked. We may refuse to dispense if the prescription is unclear, altered, expired or inconsistent with the order.</li>
                <li>Our pharmacist may contact you with questions about dosage or interactions. This is a safety check, not medical advice; always follow your doctor’s instructions.</li>
                <li>Controlled or narcotic medicines are not sold through this website.</li>
                <li>Medicines are supplied for the named patient only and must not be resold.</li>
              </ul>
            </section>

            <section id="returns" className="scroll-mt-28">
              <h2>7. Returns and refunds</h2>
              <p>Because our products are health and agricultural goods, returns are limited for safety reasons:</p>
              <ul>
                <li><strong>Medicines cannot be returned or exchanged once delivered</strong>, even if unopened, in line with pharmacy regulations. Please check the item with the rider before accepting it.</li>
                <li>Other products may be returned within <strong>48 hours</strong> of delivery if they arrived damaged, expired or different from what you ordered, provided they are unopened and in original packaging.</li>
                <li>Opened personal-care items, supplements and farm inputs cannot be returned unless faulty.</li>
                <li>Approved returns are collected by our rider and refunded in cash or by mobile money within 5 working days, or replaced at your choice.</li>
              </ul>
            </section>

            <section id="cancellations" className="scroll-mt-28">
              <h2>8. Cancellations</h2>
              <ul>
                <li>You may cancel an order request at any time before it is confirmed, simply by telling us on the call or messaging us on WhatsApp.</li>
                <li>After confirmation you may still cancel free of charge until the rider has left the shop. Once the order is on its way, a cancellation may incur the delivery fee.</li>
                <li>We may cancel a confirmed order if a product becomes unavailable, if a prescription cannot be verified, or for reasons beyond our control. You will not be charged for cancelled orders.</li>
              </ul>
            </section>

            <section id="product-info" className="scroll-mt-28">
              <h2>9. Product information</h2>
              <p>Product descriptions, images and blog articles are provided for general information. They are not a substitute for advice from your doctor, pharmacist or agronomist about your specific situation. Images are illustrative; packaging may vary. Always read the label and leaflet before use and keep products out of reach of children.</p>
            </section>

            <section id="acceptable-use" className="scroll-mt-28">
              <h2>10. Using the website</h2>
              <p>You agree not to place false order requests, use someone else’s phone number without permission, attempt to interfere with the website’s security, or copy our content for commercial use. All text, images and branding on the site belong to Di-Grow or its licensors.</p>
            </section>

            <section id="liability" className="scroll-mt-28">
              <h2>11. Our liability</h2>
              <p>We take care to supply genuine products in good condition. To the extent permitted by Rwandan law:</p>
              <ul>
                <li>Our total liability for any order is limited to the price you paid for that order.</li>
                <li>We are not liable for delays or failures caused by events outside our reasonable control, including weather, road closures, network outages or supplier shortages.</li>
                <li>We are not liable for harm resulting from using a product contrary to its label, your prescription or professional advice.</li>
              </ul>
              <p>Nothing in these terms limits liability for death, personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law. Your statutory rights as a consumer under Rwandan law are not affected.</p>
            </section>

            <section id="privacy" className="scroll-mt-28">
              <h2>12. Privacy</h2>
              <p>We handle your personal information, including prescription data, as described in our <Link to="/privacy-policy">Privacy Policy</Link>, which forms part of these terms.</p>
            </section>

            <section id="changes" className="scroll-mt-28">
              <h2>13. Changes to these terms</h2>
              <p>We may update these terms from time to time. The version published on the website on the date your order is confirmed applies to that order. The “last updated” date at the top shows the current version.</p>
            </section>

            <section id="governing-law" className="scroll-mt-28">
              <h2>14. Governing law</h2>
              <p>These terms and every order are governed by the <strong>laws of the Republic of Rwanda</strong>. We will always try to resolve any complaint directly with you first. If that is not possible, disputes are subject to the jurisdiction of the competent courts of Kigali, without prejudice to your right to bring a complaint before the Rwanda Inspectorate, Competition and Consumer Protection Authority (RICA).</p>
            </section>

            <section id="contact" className="scroll-mt-28">
              <h2>15. Contact</h2>
              <ul>
                <li><strong>Email:</strong> <a href={`mailto:${settings.email}`}>{settings.email}</a></li>
                <li><strong>Phone / WhatsApp:</strong> {settings.phone}</li>
                <li><strong>Address:</strong> {settings.address}</li>
                <li><strong>Hours:</strong> {settings.openingHours}</li>
              </ul>
            </section>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl2 bg-surface-2/60 p-6">
              <p className="!mb-0 text-sm text-muted">Questions about an order or these terms?</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact" className="btn btn-primary btn-md">
                  Contact us
                </Link>
                <Link to="/faq" className="btn btn-secondary btn-md">
                  Read the FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
