import { AlertTriangle, RefreshCw } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';

/** Error placeholder for data pages, with a retry button that calls refetch. */
export default function ErrorState({ message = 'We could not load this data.', onRetry, compact = false }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong"
      description={message}
      compact={compact}
      action={
        onRetry && (
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}
