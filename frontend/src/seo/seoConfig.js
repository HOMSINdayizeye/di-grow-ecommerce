import { SITE } from '@/constants/site';

export const seoConfig = {
  siteName: SITE.name,
  siteUrl: SITE.url,
  defaultTitle: 'Di-Grow | Health, Wellness and Growth Products in Kigali',
  titleTemplate: '%s | Di-Grow',
  defaultDescription:
    'Order trusted health, wellness and agricultural growth products in Kigali. Request an order online, we call to confirm, and deliver to your door.',
  defaultImage: `${SITE.url}/images/og-default.jpg`,
  locale: 'en_RW',
  twitterHandle: '@digrow',
  keywords: [
    'Di-Grow',
    'pharmacy Kigali',
    'health products Rwanda',
    'organic fertilizer Rwanda',
    'supplements Kigali',
    'order online Kigali delivery',
  ],
};

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path;
  return `${seoConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export default seoConfig;
