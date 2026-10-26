import { Toaster } from 'react-hot-toast';

/** App-wide toast host, themed to match the surface tokens. */
export default function Toast() {
  return (
    <Toaster
      position="bottom-right"
      gutter={10}
      toastOptions={{
        duration: 3500,
        style: {
          background: 'rgb(var(--c-surface))',
          color: 'rgb(var(--c-ink))',
          border: '1px solid var(--glass-border)',
          borderRadius: '14px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          fontSize: '14px',
          maxWidth: '380px',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  );
}
