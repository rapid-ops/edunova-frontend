'use client';
import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const API = process.env.NEXT_PUBLIC_API_URL;

function OAuthHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const redirect = (role: string) => {
    if (role === 'super_admin') router.push('/dashboard');
    else if (role === 'school_admin') router.push('/school-admin');
    else if (role === 'teacher') router.push('/teacher');
    else if (role === 'student') router.push('/student');
    else router.push('/parent');
  };

  useEffect(() => {
    // Server redirect flow (token + user in query params)
    const token = params.get('token');
    const userRaw = params.get('user');
    const error = params.get('error');

    if (error) { router.push('/auth/login?error=' + error); return; }

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        setAuth(user, token);
        redirect(user.role);
      } catch { router.push('/auth/login?error=parse'); }
      return;
    }

    // Implicit flow — id_token in URL hash
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const idToken = hashParams.get('id_token');

    if (idToken) {
      fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.error) { router.push('/auth/login?error=' + encodeURIComponent(data.error)); return; }
          if (data.totp_required) { router.push('/auth/login?totp=1&partial=' + data.partial_token); return; }
          setAuth(data.user, data.token);
          redirect(data.user.role);
        })
        .catch(() => router.push('/auth/login?error=server'));
      return;
    }

    router.push('/auth/login?error=oauth');
  }, []);

  return <p className="text-gray-500 text-sm">Signing you in...</p>;
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Suspense fallback={<p className="text-gray-500 text-sm">Loading...</p>}>
        <OAuthHandler />
      </Suspense>
    </div>
  );
}
