import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { Ban, Clock, FileCheck2, PhoneCall, RotateCcw, SearchX, ShieldCheck, Tag, Truck } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import ProductSchema from '@/seo/ProductSchema';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Loader';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductGrid from '@/components/product/ProductGrid';
import PrescriptionBadge from '@/components/product/PrescriptionBadge';
import { useProduct } from '@/hooks/useProducts';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency } from '@/utils/formatCurrency';

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'details', label: 'How to use & details' },
  { id: 'delivery', label: 'Delivery & returns' },
];

function DetailsSkeleton() {
  return (
    <div className="container py-8 md:py-12">
      <Skeleton className="h-4 w-64" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-xl2" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-9 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-14 w-32 rounded-pill" />
            <Skeleton className="h-14 w-44 rounded-pill" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const { data, loading, error } = useProduct(slug);
  const { settings } = useSettings();
  const [tab, setTab] = useState('description');

  const product = data?.slug === slug ? data : null;

  if (error) {
    return (
      <div className="container section">
        <SEOHead title="Product not found" noIndex />
        <EmptyState
          icon={SearchX}
          title={error.status === 404 ? 'Product not found' : "We couldn't load this product"}
          description={error.status === 404 ? 'It may be out of our catalogue or the link is incorrect. Browse the shop to find something similar.' : error.message}
          action={
            <Button to="/shop" size="md">
              Back to the shop
            </Button>
          }
        />
      </div>
    );
  }

  if (loading || !product) return <DetailsSkeleton />;

  const paragraphs = String(product.description || product.shortDescription || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const freeAt = Number(settings.freeDeliveryThreshold) || 0;

  return (
    <div>
      <SEOHead title={product.name} description={product.shortDescription} image={product.images?.[0]} type="product" />
      <ProductSchema product={product} />

      <div className="container py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: 'Shop', to: '/shop' },
            ...(product.category ? [{ label: product.category.name, to: `/category/${product.category.slug}` }] : []),
            { label: product.name },
          ]}
        />

        {/* Gallery + info */}
        <div className="mt-8 grid gap-10 animate-fade-up lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />
          <ProductInfo product={product} />
        </div>

        {/* Tabs */}
        <section className="mt-14 md:mt-20">
          <div className="flex gap-2 overflow-x-auto border-b border-line pb-px scrollbar-thin" role="tablist" aria-label="Product information">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'relative whitespace-nowrap px-4 py-3 font-ui text-sm font-semibold transition',
                  tab === t.id ? 'text-brand-500' : 'text-muted hover:text-ink'
                )}
              >
                {t.label}
                {tab === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-pill bg-gradient-brand" />}
              </button>
            ))}
          </div>

          <div className="card mt-6 p-6 md:p-8" role="tabpanel">
            {tab === 'description' && (
              <div className="prose-dg max-w-3xl">
                <h2 className="!mt-0 font-display text-2xl font-bold">About {product.name}</h2>
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {product.requiresPrescription && (
                  <p className="!text-accent-500">
                    <strong className="!text-accent-500">Prescription required.</strong> Our pharmacist verifies your prescription on WhatsApp when we call to confirm.
                  </p>
                )}
              </div>
            )}

            {tab === 'details' && (
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h2 className="font-display text-2xl font-bold">How to use</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Follow the directions printed on the pack and the guidance of your doctor, pharmacist or agronomist. Not sure how this product fits your routine or your crop? Ask us on WhatsApp before you order and a team member will advise.
                  </p>
                  {product.requiresPrescription && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-accent-500/30 bg-accent-500/10 p-4 text-sm">
                      <FileCheck2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-500" />
                      <span className="text-muted">Take exactly as prescribed. Do not share this medicine with others or stop early without medical advice.</span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Product details</h2>
                  <dl className="mt-4 divide-y divide-line text-sm">
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted">Brand</dt>
                      <dd className="font-medium text-ink">{product.brand || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted">SKU</dt>
                      <dd className="font-mono text-xs font-medium text-ink">{product.sku}</dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted">Category</dt>
                      <dd className="font-medium">
                        {product.category ? (
                          <Link to={`/category/${product.category.slug}`} className="text-brand-500 hover:underline">
                            {product.category.name}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted">Price</dt>
                      <dd className="font-ui font-bold text-ink">{formatCurrency(product.price)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted">Availability</dt>
                      <dd className={clsx('font-medium', product.inStock ? 'text-success' : 'text-danger')}>{product.inStock ? 'In stock' : 'Out of stock'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted">Prescription</dt>
                      <dd>{product.requiresPrescription ? <PrescriptionBadge /> : <span className="font-medium text-ink">Not required</span>}</dd>
                    </div>
                  </dl>
                  {product.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Tag className="h-4 w-4 text-muted" />
                      {product.tags.map((t) => (
                        <span key={t} className="badge border border-brand-500/30 bg-brand-500/10 text-brand-500">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'delivery' && (
              <div>
                <h2 className="font-display text-2xl font-bold">Delivery & returns</h2>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {[
                    {
                      icon: Truck,
                      title: 'Same-day delivery in Kigali',
                      text: `Orders confirmed before 3 PM are usually delivered the same day across Gasabo, Kicukiro and Nyarugenge. Delivery is ${formatCurrency(settings.deliveryFee)}${freeAt ? `, free on orders over ${formatCurrency(freeAt)}` : ''}.`,
                    },
                    {
                      icon: PhoneCall,
                      title: 'We call before we deliver',
                      text: 'No online payment. After you send a request, a team member calls or WhatsApps you to confirm the items, total and delivery time.',
                    },
                    {
                      icon: Clock,
                      title: 'Pay on delivery',
                      text: 'Pay the rider in cash or by mobile money (MTN MoMo or Airtel Money) when your order arrives. You only pay for what you receive.',
                    },
                    {
                      icon: RotateCcw,
                      title: 'Returns on general products',
                      text: 'Unopened supplements, personal care items, devices and farm inputs can be exchanged within 48 hours if they arrive damaged or incorrect. Contact us on WhatsApp with a photo.',
                    },
                    {
                      icon: Ban,
                      title: 'No returns on medicines',
                      text: 'For safety reasons, prescription and over-the-counter medicines cannot be returned or exchanged once delivered, in line with pharmacy regulations.',
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Genuine products only',
                      text: 'Everything we sell is sourced from licensed suppliers and checked by our team before dispatch.',
                    },
                  ].map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex items-start gap-3 rounded-xl2 bg-surface-2 p-4">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-soft text-brand-500">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-ink">{title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                {settings.deliveryNote && <p className="mt-4 text-xs text-muted">{settings.deliveryNote}</p>}
              </div>
            )}
          </div>
        </section>

        {/* Related */}
        {product.related?.length > 0 && (
          <section className="mt-16 md:mt-24">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="eyebrow mb-4">You may also like</span>
                <h2 className="section-title text-balance">
                  Related <span className="text-gradient">Products</span>
                </h2>
              </div>
              {product.category && (
                <Link to={`/category/${product.category.slug}`} className="btn btn-secondary btn-md">
                  More in {product.category.name}
                </Link>
              )}
            </div>
            <div className="mt-10">
              <ProductGrid products={product.related} columns={4} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
