import { useMemo } from 'react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { useFetch } from './useFetch';

/** Paginated, filterable product list. `params` must be a stable object (memoise in caller). */
export function useProducts(params = {}) {
  const key = JSON.stringify(params);
  return useFetch(() => productService.list(params), [key], { initialData: [] });
}

export function useProduct(slug) {
  return useFetch(() => productService.getBySlug(slug), [slug], { enabled: !!slug });
}

export function useFeaturedProducts(limit = 8) {
  return useFetch(() => productService.featured(limit), [limit], { initialData: [] });
}

export function useCategories() {
  const res = useFetch(() => categoryService.list(), [], { initialData: [] });
  const bySlug = useMemo(() => Object.fromEntries((res.data || []).map((c) => [c.slug, c])), [res.data]);
  return { ...res, bySlug };
}

export default useProducts;
