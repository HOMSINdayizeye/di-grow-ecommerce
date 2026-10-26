import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '@/services/api';

/**
 * Minimal data-fetching hook.
 *   const { data, meta, loading, error, refetch } = useFetch(() => productService.list(params), [params]);
 * The fetcher must return { data, meta? }. Stale responses are ignored.
 */
export function useFetch(fetcher, deps = [], { enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (id !== requestId.current) return;
      setData(res?.data ?? null);
      setMeta(res?.meta ?? null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError({ message: getErrorMessage(err), status: err?.response?.status });
    } finally {
      if (id === requestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (enabled) run();
  }, [run, enabled]);

  return { data, meta, loading, error, refetch: run, setData };
}

export default useFetch;
