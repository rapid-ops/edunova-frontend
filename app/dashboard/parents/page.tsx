'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function ParentsRedirect() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  useEffect(() => { useAuthStore.getState().hydrate(); }, []);
  useEffect(() => {
    if (user) router.replace(user.role === 'parent' ? '/parent/children' : '/school-admin/parents');
  }, [user, router]);
  return <div className="min-h-screen" aria-busy="true" />;
}
