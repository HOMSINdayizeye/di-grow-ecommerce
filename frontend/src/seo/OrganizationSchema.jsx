import { Helmet } from 'react-helmet-async';
import { SITE } from '@/constants/site';
import { seoConfig } from './seoConfig';

export default function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Store'],
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/logo.svg`,
    description: seoConfig.defaultDescription,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address,
      addressLocality: 'Kigali',
      addressCountry: 'RW',
    },
    areaServed: { '@type': 'City', name: 'Kigali' },
    currenciesAccepted: 'RWF',
    openingHours: 'Mo-Sa 08:00-19:00',
    sameAs: Object.values(SITE.social),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.phone,
      contactType: 'customer service',
      availableLanguage: ['en', 'rw', 'fr'],
    },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
