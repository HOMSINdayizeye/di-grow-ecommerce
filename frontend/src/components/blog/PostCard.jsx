import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Clock, ArrowUpRight } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';

export default function PostCard({ post, featured = false, className }) {
  return (
    <article className={clsx('card card-hover group reveal flex flex-col overflow-hidden', featured && 'md:flex-row', className)}>
      <Link to={`/blog/${post.slug}`} className={clsx('relative block overflow-hidden bg-surface-2', featured ? 'aspect-[16/10] md:w-1/2 md:aspect-auto' : 'aspect-[16/10]')}>
        <img src={post.coverImage} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="badge absolute left-3 top-3 bg-navy-900/70 text-white backdrop-blur">{post.category}</span>
      </Link>
      <div className={clsx('flex flex-1 flex-col p-5', featured && 'md:p-8')}>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readTime} min read
          </span>
        </div>
        <h3 className={clsx('mt-2 font-display font-bold leading-snug text-ink', featured ? 'text-2xl md:text-3xl' : 'text-lg line-clamp-2')}>
          <Link to={`/blog/${post.slug}`} className="hover:text-brand-500">
            {post.title}
          </Link>
        </h3>
        <p className={clsx('mt-2 text-sm text-muted', featured ? 'line-clamp-3' : 'line-clamp-2')}>{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">{post.author?.name?.charAt(0)}</span>
            <div className="text-xs">
              <p className="font-semibold text-ink">{post.author?.name}</p>
              <p className="text-muted">{post.author?.role}</p>
            </div>
          </div>
          <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-500">
            Read <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
