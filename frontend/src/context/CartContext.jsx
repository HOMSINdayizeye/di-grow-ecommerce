/**
 * localStorage-backed cart. There is no customer account; the cart lives in
 * the browser until an order request is submitted.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import toast from 'react-hot-toast';
import { getItem, setItem } from '@/utils/storage';
import { USE_MOCK } from '@/services/api';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart';
const MAX_QTY = 50;

/** Real products have MongoDB ids; demo products have ids like "p1". */
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;
const isUsableItem = (i) => i && i.productId && i.quantity > 0 && (USE_MOCK || OBJECT_ID_RE.test(String(i.productId)));

/**
 * Items saved while the site ran on demo data (or by an older version) cannot be ordered from
 * the real API, so they are dropped when the cart loads instead of failing at checkout.
 */
const readSaved = () => {
  const saved = getItem(STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.filter(isUsableItem) : [];
};
const initial = () => ({ items: readSaved() });
const sameItems = (a, b) => a.length === b.length && a.every((x, i) => x.productId === b[i].productId && x.quantity === b[i].quantity);

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
    case 'REMOVE_MANY':
      return { items: state.items.filter((i) => !action.productIds.includes(i.productId)) };
    case 'REPLACE':
      return sameItems(state.items, action.items) ? state : { items: action.items };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const [isOpen, setIsOpen] = useState(false);
  // Last product added, used by the mini cart to show a short "added" preview.
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    setItem(STORAGE_KEY, state.items);
  }, [state.items]);

  // The saved cart is the truth. Re-read it when another tab changed it, when this page comes
  // back from the browser's back-forward cache (after WhatsApp, for example) or regains focus,
  // so an order placed elsewhere is not resurrected by a stale copy in memory.
  useEffect(() => {
    const sync = () => dispatch({ type: 'REPLACE', items: readSaved() });
    const onStorage = (e) => {
      if (e.key === null || e.key === `dg:${STORAGE_KEY}`) sync();
    };
    const onPageShow = (e) => {
      if (e.persisted) sync();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const addItem = useCallback((product, quantity = 1) => {
    if (!product?.inStock) {
      toast.error('This product is currently out of stock.');
      return;
    }
    dispatch({ type: 'ADD', product, quantity });
    setLastAdded({ name: product.name, image: product.images?.[0] || '', quantity, at: Date.now() });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => dispatch({ type: 'UPDATE', productId, quantity }), []);
  const removeItem = useCallback((productId) => dispatch({ type: 'REMOVE', productId }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const removeItems = useCallback((productIds) => dispatch({ type: 'REMOVE_MANY', productIds }), []);
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
      removeItems,
      clearCart,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      lastAdded,
    };
  }, [state.items, isOpen, lastAdded, addItem, updateQuantity, removeItem, removeItems, clearCart, openCart, closeCart, toggleCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}

export default CartContext;
