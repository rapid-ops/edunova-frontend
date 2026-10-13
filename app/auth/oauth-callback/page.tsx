'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const HOME: Record<string, string> = { super_admin: '/dashboard', school_admin: '/school-admin', teacher: '/teacher', student: '/student', parent: '/parent' };

export default function OAuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  useEffect(() => {
    const idToken = new URLSearchParams(window.location.hash.slice(1)).get('id_token');
    if (!idToken) { router.replace('/auth/login?error=oauth'); return; }
    api.post('/auth/google', { id_token: idToken })
      .then((r) => {
        if (r.data.totp_required) { router.replace('/auth/login?totp=1&partial=' + encodeURIComponent(r.data.partial_token)); return; }
        setAuth(r.data.user, r.data.token);
        router.replace(HOME[r.data.user.role] || '/dashboard');
      })
      .catch((e) => router.replace('/auth/login?error=' + encodeURIComponent(e?.response?.data?.error || 'server')));
  }, []);
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500 text-sm">Signing you in...</p></div>;
}
