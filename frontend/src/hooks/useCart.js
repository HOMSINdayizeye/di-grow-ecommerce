import { useCartContext } from '@/context/CartContext';

/** Convenience re-export so pages import from hooks. */
export function useCart() {
  return useCartContext();
}

export default useCart;
