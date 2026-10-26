import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/15">
          <AlertTriangle className="h-7 w-7 text-danger" />
        </div>
        <h2 className="font-display text-2xl font-bold">Something went wrong</h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          An unexpected error occurred while rendering this page. Reloading usually fixes it.
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" className="btn btn-primary btn-md" onClick={() => window.location.reload()}>
            Reload page
          </button>
          <a href="/" className="btn btn-secondary btn-md">
            Go home
          </a>
        </div>
        {import.meta.env.DEV && (
          <pre className="mt-6 max-w-2xl overflow-auto rounded-xl bg-surface-2 p-4 text-left text-xs text-danger">
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        )}
      </div>
    );
  }
}
