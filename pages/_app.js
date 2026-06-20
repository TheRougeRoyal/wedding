import { useEffect, useState } from 'react';
import { ensureAuth } from '@/lib/firestore-storage';
import { ToastProvider } from '@/components/Toast';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureAuth().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark">
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </div>
  );
}
