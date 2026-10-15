'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const GID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const HOME: Record<string, string> = { super_admin: '/dashboard', school_admin: '/school-admin', teacher: '/teacher', student: '/student', parent: '/parent' };
const ERR: Record<string, string> = {
  no_account: 'No account found for this Google email. Ask your school admin to create one.',
  suspended: 'Account suspended, contact your administrator',
  server: 'Sign-in failed. Try again.',
  oauth: 'Google sign-in failed. Try again.',
  parse: 'Sign-in failed. Try again.',
};
const inp = 'w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500';
const btn = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition disabled:opacity-50';

function Inner() {
  const router = useRouter();
  const sp = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [partial, setPartial] = useState('');
  const [code, setCode] = useState('');
  const [backup, setBackup] = useState(false);

  useEffect(() => {
    const e = sp.get('error');
    if (e) setError(ERR[e] || e);
    const p = sp.get('partial');
    if (sp.get('totp') && p) setPartial(p);
  }, [sp]);

  const finish = (d: any) => { setAuth(d.user, d.token); router.push(HOME[d.user.role] || '/dashboard'); };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await api.post('/auth/login', form);
      if (r.data.totp_required) { setPartial(r.data.partial_token); setCode(''); return; }
      finish(r.data);
    } catch (err: any) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const body = backup ? { partial_token: partial, backup_code: code.trim() } : { partial_token: partial, totp_token: code.trim() };
      const r = await api.post(backup ? '/mfa/backup-code' : '/mfa/verify-login', body);
      finish(r.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
      if (err.response?.status === 401) { setPartial(''); setCode(''); }
    } finally { setLoading(false); }
  };

  const google = () => {
    if (!GID) { setError('Google sign-in is not configured'); return; }
    const q = new URLSearchParams({
      client_id: GID, redirect_uri: (window.location.hostname === 'localhost' ? window.location.origin : 'https://edunova-frontend-gkaj.vercel.app') + '/auth/oauth-callback',
      response_type: 'id_token', scope: 'openid email profile',
      nonce: Math.random().toString(36).slice(2), prompt: 'select_account',
    });
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + q.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Edunova</h1>
        <p className="text-gray-500 mb-6 text-sm">{partial ? 'Two-factor verification' : 'Sign in to your account'}</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        {!partial ? (
          <>
            <form onSubmit={signIn} className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} placeholder="you@school.com" required />
              </div>
              <div>
                <label className="text-gray-600 text-sm mb-1 block">Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inp} placeholder="Password" required />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => router.push('/auth/forgot-password')} className="text-blue-600 text-sm">Forgot password?</button>
              </div>
              <button type="submit" disabled={loading} className={btn}>{loading ? 'Signing in...' : 'Sign In'}</button>
            </form>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" />
            </div>
            <button type="button" onClick={google} className="w-full border border-gray-300 rounded-lg py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Login with Google</button>
          </>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm mb-1 block">{backup ? 'Backup code' : '6-digit authenticator code'}</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} className={inp + ' text-center tracking-widest'}
                inputMode={backup ? 'text' : 'numeric'} maxLength={backup ? 16 : 6} autoComplete="one-time-code" autoFocus required />
            </div>
            <button type="submit" disabled={loading} className={btn}>{loading ? 'Verifying...' : 'Verify'}</button>
            <button type="button" onClick={() => { setBackup(!backup); setCode(''); setError(''); }} className="w-full text-blue-600 text-sm">
              {backup ? 'Use authenticator code' : 'Use a backup code'}
            </button>
            <button type="button" onClick={() => { setPartial(''); setCode(''); setError(''); }} className="w-full text-gray-500 text-sm">Back to sign in</button>
          </form>
        )}

        <p className="mt-6 text-center text-gray-500 text-sm">
          New school? <button onClick={() => router.push('/onboarding')} className="text-blue-600">Register your school</button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <Inner />
    </Suspense>
  );
}
