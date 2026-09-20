'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { registerServiceWorker } from '@/lib/sw-register';
import NetworkBanner from '@/components/ui/NetworkBanner';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setAuth(JSON.parse(user), token);
    }
    registerServiceWorker();
  }, []);

  return (
    <html lang="en">
      <body>
        <NetworkBanner />
        {children}
      </body>
    </html>
  );
}
