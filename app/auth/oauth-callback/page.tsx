'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = params.get('token');
    const userRaw = params.get('user');
    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        setAuth(user, token);
        const role = user.role;
        if (role === 'super_admin') router.push('/dashboard');
        else if (role === 'school_admin') router.push('/school-admin');
        else if (role === 'teacher') router.push('/teacher');
        else if (role === 'student') router.push('/student');
        else router.push('/parent');
      } catch { router.push('/auth/login?error=parse'); }
    } else {
      router.push('/auth/login?error=oauth');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Signing you in...</p>
    </div>
  );
}
