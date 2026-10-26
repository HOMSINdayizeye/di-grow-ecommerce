import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { CalendarDays, ShieldCheck, Mail } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHero from '@/components/common/PageHero';
import { useReveal } from '@/hooks/useReveal';
import { useSettings } from '@/hooks/useSettings';
import { formatDate } from '@/utils/formatDate';

const LAST_UPDATED = '2026-10-01';

const SECTIONS = [
  {
    id: 'who-we-are',
    title: '1. Who we are',
    body: (
      <>
        <p>Di-Grow is a retail shop based in Kigali, Rwanda, selling health supplements, personal care products, pharmacist-verified prescription medicines and organic farm inputs. This policy explains what personal information we collect when you use our website or contact us, why we collect it and how we keep it safe.</p>
        <p>We are the “data controller” for the information described here, as defined by Rwanda’s Law No. 058/2021 relating to the protection of personal data and privacy.</p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: '2. Information we collect',
    body: (
      <>
        <p>We only collect what we need to confirm and deliver your order. Depending on how you use the site, this includes:</p>
        <ul>
          <li><strong>Order request details:</strong> your name, phone number, delivery district, sector and address, and any notes you add (for example a landmark for the rider).</li>
          <li><strong>Email address:</strong> if you provide one on an order request or the contact form, so we can send confirmations and replies.</li>
          <li><strong>Contact form messages:</strong> your name, email, subject and the message you write to us.</li>
          <li><strong>Prescription information:</strong> for prescription medicines, a photo of your prescription and the name of the patient, shared by you on WhatsApp (see section 5).</li>
          <li><strong>Order history:</strong> the products you requested, the delivery address used and the status of each order, so we can track and support it.</li>
          <li><strong>Technical data:</strong> standard server logs (IP address, browser type, pages visited) used only to keep the site secure and working.</li>
        </ul>
        <p>We do <strong>not</strong> collect card numbers, bank details or mobile-money PINs. Di-Grow does not take online payments; you pay the rider on delivery.</p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: '3. How we use your information',
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Call or message you to confirm your order request, the total and a delivery time.</li>
          <li>Verify prescriptions with our licensed pharmacist before dispensing medicines.</li>
          <li>Deliver your order and let the rider find your address and reach you by phone.</li>
          <li>Reply to questions sent through the contact form, by email, phone or WhatsApp.</li>
          <li>Keep records required by Rwandan pharmacy and tax regulations.</li>
          <li>Improve the shop, for example by seeing which products are popular. This uses aggregated data that does not identify you.</li>
        </ul>
        <p>We do not sell your information, and we do not use it for third-party advertising. We may send you a WhatsApp message or SMS about a product you asked about or a seasonal offer, and you can tell us to stop at any time.</p>
      </>
    ),
  },
  {
    id: 'whatsapp',
    title: '4. Phone calls and WhatsApp',
    body: (
      <>
        <p>Because we confirm every order by phone, your phone number is the main way we reach you. We may call you, send an SMS or message you on WhatsApp from our official business number shown on the Contact page.</p>
        <p>WhatsApp is operated by Meta Platforms and messages are end-to-end encrypted in transit. Anything you send us on WhatsApp (including prescription photos) is stored on our business phone and in WhatsApp’s systems according to <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">WhatsApp’s own privacy policy</a>. If you prefer not to use WhatsApp, you can call us or send a prescription photo by email.</p>
      </>
    ),
  },
  {
    id: 'prescriptions',
    title: '5. Prescription and health data',
    body: (
      <>
        <p>Prescriptions and the health information on them are sensitive personal data. We handle them with extra care:</p>
        <ul>
          <li>Only our licensed pharmacist and the staff member confirming your order can see your prescription.</li>
          <li>We use it solely to verify the prescription, dispense the correct medicine and keep the dispensing record required by law.</li>
          <li>Prescription images are deleted from staff phones once the order is closed, and the dispensing record is kept securely for the period required by the Rwanda FDA and the National Pharmacy Council.</li>
          <li>We never share your health information with employers, insurers or marketers.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '6. Cookies and local storage',
    body: (
      <>
        <p>Our website does not use advertising or tracking cookies. It stores a small amount of data in your browser’s <strong>local storage</strong> so that the site works properly:</p>
        <ul>
          <li><strong>Your cart:</strong> the products and quantities you have added, so they are still there if you close the tab.</li>
          <li><strong>Theme preference:</strong> whether you chose light or dark mode.</li>
          <li><strong>Recent order:</strong> a reference to your last order request so you can reopen the confirmation page.</li>
        </ul>
        <p>This data stays on your device and is never sent to us until you submit an order request. You can clear it at any time from your browser settings.</p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: '7. Who we share information with',
    body: (
      <>
        <p>We share only what is needed, only with:</p>
        <ul>
          <li><strong>Delivery riders:</strong> your name, phone number and address so they can deliver and call you when close.</li>
          <li><strong>Service providers:</strong> the companies that host our website and send our SMS or email notifications. They may only process data on our instructions.</li>
          <li><strong>Authorities:</strong> the Rwanda FDA, Rwanda Revenue Authority or other regulators where the law requires it, for example pharmacy dispensing records.</li>
        </ul>
        <p>We do not transfer your data outside Rwanda except where our hosting or messaging providers store it abroad with appropriate safeguards.</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: '8. How long we keep it',
    body: (
      <>
        <ul>
          <li><strong>Order records:</strong> 5 years, to meet tax and consumer-protection requirements.</li>
          <li><strong>Prescription dispensing records:</strong> the period required by pharmacy regulations, currently 5 years.</li>
          <li><strong>Prescription photos on staff devices:</strong> deleted once the order is closed.</li>
          <li><strong>Contact form messages:</strong> 12 months after our last reply.</li>
          <li><strong>Server logs:</strong> 90 days.</li>
        </ul>
        <p>When the retention period ends, data is deleted or anonymised.</p>
      </>
    ),
  },
  {
    id: 'security',
    title: '9. How we protect it',
    body: (
      <>
        <p>Our website is served over HTTPS, staff accounts are password-protected and limited to the information each role needs, and order data is backed up regularly. No method of storage is completely secure, so if we ever discover a breach that affects you we will inform you and the National Cyber Security Authority as required by law.</p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: '10. Your rights',
    body: (
      <>
        <p>Under Rwandan data-protection law you have the right to:</p>
        <ul>
          <li>Ask what personal information we hold about you and receive a copy.</li>
          <li>Ask us to correct information that is wrong or out of date.</li>
          <li>Ask us to delete information we no longer need to keep by law.</li>
          <li>Object to marketing messages at any time by replying “STOP” or telling us on the phone.</li>
          <li>Complain to the National Cyber Security Authority (NCSA), Rwanda’s data-protection supervisory authority.</li>
        </ul>
        <p>To exercise any of these rights, contact us using the details below. We will respond within 30 days.</p>
      </>
    ),
  },
  {
    id: 'children',
    title: '11. Children',
    body: (
      <>
        <p>Our site is intended for adults. Products for children (for example in the Mother & Baby category) must be ordered by a parent or guardian. We do not knowingly collect information from anyone under 18; if you believe a child has sent us personal data, contact us and we will delete it.</p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '12. Changes to this policy',
    body: (
      <>
        <p>We may update this policy as our services or the law change. The “last updated” date at the top shows the current version. Significant changes will be announced on the website.</p>
      </>
    ),
  },
  {
    id: 'contact',
    title: '13. Contact us',
    body: null, // rendered with live settings
  },
];

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

const IDS = SECTIONS.map((s) => s.id);

export default function PrivacyPolicyPage() {
  const { settings } = useSettings();
  const ref = useReveal();
  const active = useActiveSection(IDS);

  return (
    <div ref={ref}>
      <SEOHead title="Privacy Policy" description="How Di-Grow collects, uses and protects your personal information when you request an order, contact us or share a prescription." />

      <PageHero eyebrow="Legal" title="Privacy" highlight="Policy" subtitle="Plain-language explanation of what we collect, why, and how we keep it safe." breadcrumbs={[{ label: 'Privacy Policy' }]}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-accent-300" /> Last updated {formatDate(LAST_UPDATED, { month: 'long' })}</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> No online payments, no card data</span>
        </div>
      </PageHero>

      <section className="container section">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* TOC */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <nav aria-label="Table of contents" className="card reveal p-5 lg:sticky lg:top-28">
              <p className="font-ui text-xs font-semibold uppercase tracking-wider text-muted">On this page</p>
              <ol className="mt-3 space-y-1">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={active === s.id ? 'location' : undefined}
                      className={clsx(
                        'block rounded-lg border-l-2 py-1.5 pl-3 pr-2 text-sm transition',
                        active === s.id ? 'border-brand-500 font-semibold text-brand-500' : 'border-transparent text-muted hover:text-ink'
                      )}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
              <Link to="/terms" className="mt-5 block text-sm font-semibold text-brand-500 hover:underline">
                See also: Terms of Service →
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <div className="prose-dg min-w-0 lg:col-span-8 xl:col-span-9">
            <p className="reveal text-lg">
              At Di-Grow we only ask for the information we need to confirm and deliver your order. This policy applies to <strong>{settings.storeName}</strong>, our website and the phone, SMS, email and WhatsApp channels we use to serve you.
            </p>
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2>{s.title}</h2>
                {s.body || (
                  <>
                    <p>Questions about this policy or your data? Reach us any of these ways:</p>
                    <ul>
                      <li><strong>Email:</strong> <a href={`mailto:${settings.email}`}>{settings.email}</a></li>
                      <li><strong>Phone / WhatsApp:</strong> {settings.phone}</li>
                      <li><strong>Address:</strong> {settings.address}</li>
                      <li><strong>Hours:</strong> {settings.openingHours}</li>
                    </ul>
                  </>
                )}
              </section>
            ))}

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl2 bg-surface-2/60 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-soft text-brand-500"><Mail className="h-5 w-5" /></span>
                <p className="!mb-0 text-sm text-muted">Want to see or delete the data we hold about you?</p>
              </div>
              <Link to="/contact" className="btn btn-primary btn-md">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
