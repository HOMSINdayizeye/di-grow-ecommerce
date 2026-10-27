const env = import.meta.env;

export const SITE = {
  name: 'Di-Grow',
  tagline: 'Health, wellness and growth products delivered in Kigali',
  url: env.VITE_SITE_URL || 'https://digrow.rw',
  phone: env.VITE_PHONE_NUMBER || '+250 790911427',
  whatsapp: env.VITE_WHATSAPP_NUMBER || '250790911427',
  email: env.VITE_CONTACT_EMAIL || 'hello@digrow.rw',
  address: env.VITE_ADDRESS || 'KN 4 Ave, Nyarugenge, Kigali',
  hours: 'Mon - Sat, 8:00 AM - 7:00 PM',
  social: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://x.com',
  },
};

export function whatsappLink(message = '') {
  const text = encodeURIComponent(message || `Hello ${SITE.name}, I would like to place an order.`);
  return `https://wa.me/${SITE.whatsapp}?text=${text}`;
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const FOOTER_LINKS = {
  shop: [
    { label: 'All Products', to: '/shop' },
    { label: 'Track Order', to: '/track-order' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'FAQ', to: '/faq' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Service', to: '/terms' },
  ],
};

export default SITE;
