import { useState } from 'react';
import clsx from 'clsx';
import { Lock, Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { ORDER_STATUS, ORDER_STATUS_META, ORDER_STATUS_OPTIONS } from '@/constants/orderStatus';

const TERMINAL = [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED];

/**
 * Segmented status control. Picking a different status opens a confirm dialog
 * with an optional note, then calls onChange(status, note).
 */
export default function OrderStatusSelect({ value, onChange, loading = false, className }) {
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState('');
  const locked = TERMINAL.includes(value);

  const pick = (status) => {
    if (status === value || locked || loading) return;
    setNote('');
    setPending(status);
  };

  const confirm = async () => {
    if (!pending) return;
    try {
      await onChange(pending, note.trim());
      setPending(null);
    } catch {
      /* the hook already toasts the error; keep the dialog open */
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2" role="radiogroup" aria-label="Order status">
        {ORDER_STATUS_OPTIONS.map((opt) => {
          const meta = ORDER_STATUS_META[opt.value];
          const active = opt.value === value;
          const disabled = locked || loading;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled && !active}
              onClick={() => pick(opt.value)}
              className={clsx(
                'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left font-ui text-sm font-medium transition',
                active ? clsx(meta.classes, 'shadow-soft') : 'border-line text-muted hover:bg-surface-2 hover:text-ink',
                disabled && !active && 'cursor-not-allowed opacity-50'
              )}
            >
              <span className={clsx('h-2 w-2 rounded-full', meta.dot)} />
              {opt.label}
              {loading && active && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
            </button>
          );
        })}
      </div>

      {locked && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs text-muted">
          <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          This order is {ORDER_STATUS_META[value].label.toLowerCase()}. Its status can no longer be changed.
        </p>
      )}

      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title={pending ? `Mark as ${ORDER_STATUS_META[pending].label}?` : ''}
        description={pending ? ORDER_STATUS_META[pending].description : ''}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-md" onClick={() => setPending(null)} disabled={loading}>
              Cancel
            </button>
            <button type="button" className={clsx('btn btn-md', pending === ORDER_STATUS.CANCELLED ? 'btn-danger' : 'btn-primary')} onClick={confirm} disabled={loading}>
              {loading ? 'Saving…' : 'Confirm'}
            </button>
          </>
        }
      >
        <label htmlFor="status-note" className="label">
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="status-note"
          className="input min-h-[90px] resize-y"
          placeholder="e.g. Customer confirmed by phone, deliver after 2 PM"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
        />
        <p className="help-text">Added to the order history so the team can see what happened.</p>
      </Modal>
    </div>
  );
}
