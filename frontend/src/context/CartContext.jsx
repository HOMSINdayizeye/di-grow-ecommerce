/**
 * localStorage-backed cart. There is no customer account; the cart lives in
 * the browser until an order request is submitted.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import toast from 'react-hot-toast';
import { getItem, setItem } from '@/utils/storage';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart';
const MAX_QTY = 50;

const initial = () => ({ items: getItem(STORAGE_KEY, []) });

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, quantity } = action;
      const existing = state.items.find((i) => i.productId === product._id);
      let items;
      if (existing) {
        items = state.items.map((i) =>
          i.productId === product._id ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i
        );
      } else {
        items = [
          ...state.items,
          {
            productId: product._id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            requiresPrescription: !!product.requiresPrescription,
            category: product.category?.name || '',
            quantity: Math.min(MAX_QTY, quantity),
          },
        ];
      }
      return { items };
    }
    case 'UPDATE':
      return {
        items: state.items
          .map((i) => (i.productId === action.productId ? { ...i, quantity: Math.max(0, Math.min(MAX_QTY, action.quantity)) } : i))
          .filter((i) => i.quantity > 0),
      };
    case 'REMOVE':
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItem(STORAGE_KEY, state.items);
  }, [state.items]);

  const addItem = useCallback((product, quantity = 1, { silent = false } = {}) => {
    if (!product?.inStock) {
      toast.error('This product is currently out of stock.');
      return;
    }
    dispatch({ type: 'ADD', product, quantity });
    if (!silent) toast.success(`${product.name} added to cart`);
  }, []);

  const updateQuantity = useCallback((productId, quantity) => dispatch({ type: 'UPDATE', productId, quantity }), []);
  const removeItem = useCallback((productId) => dispatch({ type: 'REMOVE', productId }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(() => {
    const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = state.items.reduce((s, i) => s + i.quantity, 0);
    return {
      items: state.items,
      subtotal,
      count,
      hasPrescriptionItems: state.items.some((i) => i.requiresPrescription),
      isEmpty: state.items.length === 0,
      isInCart: (productId) => state.items.some((i) => i.productId === productId),
      getQuantity: (productId) => state.items.find((i) => i.productId === productId)?.quantity || 0,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
    };
  }, [state.items, isOpen, addItem, updateQuantity, removeItem, clearCart, openCart, closeCart, toggleCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}

export default CartContext;
