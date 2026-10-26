import { useEffect } from 'react';
import { useSocketContext } from '@/context/SocketContext';

/**
 * useSocket(onNewOrder?) - returns the socket state and optionally subscribes
 * a callback to new-order events for the lifetime of the component.
 */
export function useSocket(onNewOrder) {
  const ctx = useSocketContext();
  useEffect(() => {
    if (!onNewOrder) return undefined;
    return ctx.subscribe(onNewOrder);
  }, [ctx, onNewOrder]);
  return ctx;
}

export default useSocket;
