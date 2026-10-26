/**
 * Admin-only socket connection. Listens for `order:new` events on the admin
 * namespace and exposes them to the notification bell and orders pages.
 * In mock mode, it listens for the `mock:new-order` window event instead.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { USE_MOCK } from '@/services/api';
import { adminAuthService } from '@/services/adminAuthService';
import { useAdminAuth } from './AdminAuthContext';

const SocketContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAdminAuth();
  const [connected, setConnected] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [unseen, setUnseen] = useState(0);
  const listeners = useRef(new Set());
  const socketRef = useRef(null);

  const emitNewOrder = useCallback((order) => {
    setLastOrder(order);
    setUnseen((n) => n + 1);
    listeners.current.forEach((fn) => fn(order));
    toast(`New order ${order.orderNumber} from ${order.customer?.name || 'a customer'}`, { icon: '🛎️', duration: 6000 });
    try {
      new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(40)).play().catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    if (USE_MOCK) {
      const handler = (e) => emitNewOrder(e.detail);
      window.addEventListener('mock:new-order', handler);
      setConnected(true);
      return () => {
        window.removeEventListener('mock:new-order', handler);
        setConnected(false);
      };
    }

    const socket = io(`${SOCKET_URL}/admin`, {
      auth: { token: adminAuthService.getToken() },
      transports: ['websocket'],
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('order:new', emitNewOrder);
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, emitNewOrder]);

  const subscribe = useCallback((fn) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  const value = useMemo(
    () => ({ connected, lastOrder, unseen, resetUnseen: () => setUnseen(0), subscribe }),
    [connected, lastOrder, unseen, subscribe]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within SocketProvider');
  return ctx;
}

export default SocketContext;
