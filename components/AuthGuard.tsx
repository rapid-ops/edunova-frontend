'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!token && !localStorage.getItem('token')) {
      router.push('/auth/login');
    }
  }, [token]);

  return <>{children}</>;
}
