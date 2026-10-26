import { Helmet } from 'react-helmet-async';
import { absoluteUrl } from './seoConfig';

/** items: [{ label, to }] */
export default function BreadcrumbSchema({ items = [] }) {
  if (!items.length) return null;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.to ? absoluteUrl(item.to) : undefined,
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
