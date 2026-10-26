import clsx from 'clsx';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { SearchX } from 'lucide-react';

export default function ProductGrid({ products = [], loading = false, skeletons = 8, columns = 4, emptyTitle = 'No products found', emptyDescription = 'Try a different search or clear the filters.', emptyAction, className }) {
  const cols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5',
  }[columns];

  if (!loading && products.length === 0) {
    return <EmptyState icon={SearchX} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className={clsx('grid gap-4 md:gap-5', cols, className)}>
      {loading
        ? Array.from({ length: skeletons }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}
