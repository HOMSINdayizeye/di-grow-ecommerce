import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { seoConfig, absoluteUrl } from './seoConfig';

/**
 * <SEOHead title="Shop" description="..." image="..." type="website|article|product" noIndex />
 */
export default function SEOHead({ title, description, image, type = 'website', noIndex = false, canonical, children }) {
  const { pathname } = useLocation();
  const fullTitle = title ? seoConfig.titleTemplate.replace('%s', title) : seoConfig.defaultTitle;
  const desc = description || seoConfig.defaultDescription;
  const img = image ? absoluteUrl(image) : seoConfig.defaultImage;
  const url = absoluteUrl(canonical || pathname);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
      <meta name="keywords" content={seoConfig.keywords.join(', ')} />

      <meta property="og:site_name" content={seoConfig.siteName} />
      <meta property="og:locale" content={seoConfig.locale} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={seoConfig.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {children}
    </Helmet>
  );
}
