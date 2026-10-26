import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock, Facebook, Instagram, Twitter, ArrowRight } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { FOOTER_LINKS, SITE, whatsappLink } from '@/constants/site';
import { useSettings } from '@/hooks/useSettings';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-line bg-surface-2">
      <div className="divider-gradient absolute left-0 right-0 top-0" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full glow-brand blur-3xl opacity-60" />
      <div className="container relative py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Trusted health, wellness and agricultural growth products for families and farmers in Kigali.
              Request an order online, we call to confirm, and deliver to your door.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { href: settings.socialFacebook || SITE.social.facebook, Icon: Facebook, label: 'Facebook' },
                { href: settings.socialInstagram || SITE.social.instagram, Icon: Instagram, label: 'Instagram' },
                { href: settings.socialTwitter || SITE.social.twitter, Icon: Twitter, label: 'Twitter' },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-brand-500 hover:text-brand-500">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-[#25d366] hover:text-[#25d366]">
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-ui text-sm font-semibold uppercase tracking-wider text-ink">Shop</h4>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.shop.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted transition hover:text-brand-500">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-ui text-sm font-semibold uppercase tracking-wider text-ink">Company</h4>
            <ul className="mt-4 space-y-2.5">
              {[...FOOTER_LINKS.company, ...FOOTER_LINKS.legal].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted transition hover:text-brand-500">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-ui text-sm font-semibold uppercase tracking-wider text-ink">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-500" /> {settings.address}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-accent-500" />
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-brand-500">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-accent-500" />
                <a href={`mailto:${settings.email}`} className="hover:text-brand-500">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 flex-shrink-0 text-accent-500" /> {settings.openingHours}
              </li>
            </ul>
            <Link to="/track-order" className="btn btn-secondary btn-sm mt-5">
              Track an order <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted md:flex-row">
          <p>© {year} {settings.storeName}. All rights reserved.</p>
          <p>Prescription medicines are dispensed only after verification by a licensed pharmacist.</p>
        </div>
      </div>
    </footer>
  );
}
