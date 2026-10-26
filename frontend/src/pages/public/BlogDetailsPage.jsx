import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Calendar, Link2, ArrowLeft, ArrowRight, Tag, FileQuestion } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import EmptyState from '@/components/common/EmptyState';
import PostCard from '@/components/blog/PostCard';
import { Skeleton } from '@/components/common/Loader';
import { WhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useFetch } from '@/hooks/useFetch';
import { useReveal } from '@/hooks/useReveal';
import { blogService } from '@/services/blogService';
import { whatsappLink, SITE } from '@/constants/site';
import { formatDate } from '@/utils/formatDate';

function DetailsSkeleton() {
  return (
    <div className="container py-10 md:py-14" aria-busy="true">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-8 h-6 w-24 rounded-pill" />
      <Skeleton className="mt-4 h-12 w-full max-w-3xl" />
      <Skeleton className="mt-3 h-12 w-2/3 max-w-2xl" />
      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <Skeleton className="mt-10 aspect-[16/8] w-full rounded-xl3" />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
          ))}
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-56 w-full rounded-xl2" />
        </div>
      </div>
    </div>
  );
}

function Article({ post }) {
  const ref = useReveal();
  const url = `${SITE.url}/blog/${post.slug}`;
  const date = formatDate(post.publishedAt || post.createdAt);

  const copyLink = async () => {
    try {
      const href = typeof window !== 'undefined' ? window.location.href : url;
      await navigator.clipboard.writeText(href);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const shareWhatsApp = `https://wa.me/?text=${encodeURIComponent(`${post.title} - ${url}`)}`;
  const adviceLink = whatsappLink(`Hello ${SITE.name}, I read "${post.title}" on your blog and I have a question.`);

  return (
    <div ref={ref}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full glow-brand blur-3xl opacity-70" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full glow-accent blur-3xl opacity-70" />
        <div className="container relative py-10 md:py-14">
          <Breadcrumbs items={[{ label: 'Blog', to: '/blog' }, { label: post.title }]} />
          <div className="mx-auto mt-8 max-w-4xl text-center">
            <span className="badge bg-brand-500/10 text-brand-500 animate-fade-up">{post.category}</span>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-balance animate-fade-up sm:text-4xl md:text-5xl lg:text-6xl" style={{ animationDelay: '80ms' }}>
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mx-auto mt-5 max-w-2xl text-base text-muted animate-fade-up md:text-lg" style={{ animationDelay: '160ms' }}>
                {post.excerpt}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted animate-fade-up" style={{ animationDelay: '240ms' }}>
              <span className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand font-bold text-white shadow-glow">{post.author?.name?.charAt(0) || 'D'}</span>
                <span className="text-left">
                  <span className="block font-semibold text-ink">{post.author?.name || 'Di-Grow team'}</span>
                  <span className="block text-xs">{post.author?.role}</span>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {date}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readTime} min read</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        {post.coverImage && (
          <div className="mx-auto max-w-5xl overflow-hidden rounded-xl3 border shadow-float animate-fade-up" style={{ borderColor: 'var(--glass-border)' }}>
            <img src={post.coverImage} alt={post.title} className="aspect-[16/8] w-full object-cover" />
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Body */}
          <article className="min-w-0 lg:col-span-8">
            {/* Content is trusted HTML authored by the admin team. */}
            <div className="prose-dg break-words" dangerouslySetInnerHTML={{ __html: post.content || '' }} />

            {post.tags?.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-2 lg:hidden">
                {post.tags.map((t) => (
                  <span key={t} className="badge bg-surface-2 text-muted"><Tag className="h-3 w-3" /> {t}</span>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <p className="font-ui text-xs font-semibold uppercase tracking-wider text-muted">Share this article</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyLink} className="btn btn-secondary btn-sm">
                  <Link2 className="h-4 w-4" /> Copy link
                </button>
                <a href={shareWhatsApp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                  <WhatsAppIcon className="h-4 w-4" /> Share on WhatsApp
                </a>
              </div>
            </div>

            <div className="mt-8">
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to all articles
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="relative overflow-hidden rounded-xl2 bg-gradient-hero p-6 text-white shadow-card">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full glow-accent blur-3xl" />
                <div className="relative">
                  <span className="eyebrow !border-white/20 !bg-white/10 !text-white/90">Need advice?</span>
                  <h3 className="mt-4 font-display text-2xl font-bold">Talk to our team</h3>
                  <p className="mt-2 text-sm text-white/75">Our pharmacist and agronomist answer questions on WhatsApp, free of charge, during opening hours.</p>
                  <a href={adviceLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-md mt-5 w-full">
                    <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
                  </a>
                  <Link to="/shop" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-300">
                    Browse the shop <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {post.tags?.length > 0 && (
                <div className="card p-6">
                  <p className="font-ui text-xs font-semibold uppercase tracking-wider text-muted">Tags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <span key={t} className="badge bg-surface-2 text-muted"><Tag className="h-3 w-3" /> {t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      {post.related?.length > 0 && (
        <section className="container section !pt-4">
          <div className="divider-gradient mb-14 opacity-60" />
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="reveal">
              <span className="eyebrow mb-4">Keep reading</span>
              <h2 className="section-title">Related <span className="text-gradient">articles</span></h2>
            </div>
            <Link to="/blog" className="btn btn-secondary btn-md reveal">
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {post.related.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const { data: post, loading, error } = useFetch(() => blogService.getBySlug(slug), [slug]);

  if (loading) {
    return (
      <>
        <SEOHead title="Loading article…" noIndex />
        <DetailsSkeleton />
      </>
    );
  }

  if (error || !post) {
    const notFound = error?.status === 404 || !post;
    return (
      <div className="container py-16">
        <SEOHead title="Article not found" noIndex />
        <EmptyState
          icon={FileQuestion}
          title={notFound ? 'Article not found' : 'Could not load this article'}
          description={notFound ? 'This article may have been moved or unpublished.' : error?.message}
          action={
            <Link to="/blog" className="btn btn-primary btn-md">
              <ArrowLeft className="h-4 w-4" /> Back to the blog
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <SEOHead title={post.title} description={post.excerpt} image={post.coverImage} type="article" />
      <Article key={post._id} post={post} />
    </>
  );
}
