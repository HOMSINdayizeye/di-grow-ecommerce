import PostCard from './PostCard';
import { Skeleton } from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { FileText } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export default function PostList({ posts = [], loading = false, featuredFirst = false }) {
  const ref = useReveal();
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!posts.length) {
    return <EmptyState icon={FileText} title="No articles yet" description="Check back soon for health and farming tips from our team." />;
  }
  const [first, ...rest] = posts;
  return (
    <div ref={ref} className="space-y-8">
      {featuredFirst && <PostCard post={first} featured />}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(featuredFirst ? rest : posts).map((p) => (
          <PostCard key={p._id} post={p} />
        ))}
      </div>
    </div>
  );
}
