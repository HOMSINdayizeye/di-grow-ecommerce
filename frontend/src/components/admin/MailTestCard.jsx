import { useState } from 'react';
import toast from 'react-hot-toast';
import { MailCheck, MailWarning, Send, RefreshCw } from 'lucide-react';
import Button from '@/components/common/Button';
import { useFetch } from '@/hooks/useFetch';
import { settingsService } from '@/services/settingsService';
import { getErrorMessage } from '@/services/api';
import { useAdminAuth } from '@/context/AdminAuthContext';

/**
 * Shows which email provider the API is using and lets an admin send themselves a test email,
 * so a wrong Brevo login is found before a staff member needs a password reset link.
 */
export default function MailTestCard() {
  const { user } = useAdminAuth();
  const email = user?.email;
  const { data: status, loading, refetch } = useFetch(() => settingsService.mailStatus(), []);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const send = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await settingsService.sendTestEmail();
      setResult({ ok: true, message: res?.data?.message || 'Test email sent.' });
      toast.success('Test email sent');
    } catch (err) {
      setResult({ ok: false, message: getErrorMessage(err) });
      toast.error('Test email failed');
    } finally {
      setSending(false);
    }
  };

  const ok = status?.ok && status?.provider !== 'console';
  const Icon = ok ? MailCheck : MailWarning;

  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${ok ? 'bg-success/15 text-success' : 'bg-gold-500/15 text-gold-500'}`}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Email delivery</p>
            {loading && !status ? (
              <p className="text-xs text-muted">Checking the mail server…</p>
            ) : (
              <>
                <p className="break-words text-xs text-muted">{status?.detail || 'Unknown'}</p>
                {status && !status.ok && (
                  <p className="mt-1 text-xs text-danger">
                    {status.error}
                    {status.hint ? ` ${status.hint}` : ''}
                  </p>
                )}
                {status?.provider === 'console' && <p className="mt-1 text-xs text-gold-500">Reset links are only printed in the API console until BREVO_API_KEY or SMTP_HOST is set in backend/.env.</p>}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={refetch} disabled={loading}>
            Re-check
          </Button>
          <Button variant="secondary" size="sm" icon={Send} onClick={send} loading={sending} disabled={status?.provider === 'console'}>
            Send test email{email ? ` to ${email}` : ''}
          </Button>
        </div>
      </div>
      {result && <p className={`mt-3 text-xs ${result.ok ? 'text-success' : 'text-danger'}`}>{result.message}</p>}
    </div>
  );
}
