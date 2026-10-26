import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '@/services/orderService';
import { getErrorMessage } from '@/services/api';
import { useFetch } from './useFetch';

/** Admin: paginated orders list with filters. */
export function useAdminOrders(params = {}) {
  const key = JSON.stringify(params);
  return useFetch(() => orderService.adminList(params), [key], { initialData: [] });
}

/** Admin: single order plus status/notes mutations. */
export function useAdminOrder(id) {
  const res = useFetch(() => orderService.adminGet(id), [id], { enabled: !!id });
  const [saving, setSaving] = useState(false);

  const updateStatus = useCallback(
    async (status, note) => {
      setSaving(true);
      try {
        const r = await orderService.updateStatus(id, status, note);
        res.setData(r.data);
        toast.success(`Order marked as ${status}`);
        return r.data;
      } catch (err) {
        toast.error(getErrorMessage(err));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [id, res]
  );

  const updateNotes = useCallback(
    async (adminNotes) => {
      setSaving(true);
      try {
        const r = await orderService.updateNotes(id, adminNotes);
        res.setData(r.data);
        toast.success('Notes saved');
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [id, res]
  );

  return { ...res, saving, updateStatus, updateNotes };
}

/** Public: submit an order request. */
export function useCreateOrder() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await orderService.create(payload);
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submit, submitting, error };
}

/** Public: track an order by number + phone. */
export function useTrackOrder() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const track = useCallback(async (values) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await orderService.track(values);
      setOrder(res.data);
      return res.data;
    } catch (err) {
      setError(getErrorMessage(err, 'We could not find that order.'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { order, loading, error, track, reset: () => setOrder(null) };
}

export default useAdminOrders;
