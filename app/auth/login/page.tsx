'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Bot, BadgeCheck, Users } from 'lucide-react';
import api from '@/lib/api';
import Logo from '@/components/Logo';
import { useAuthStore } from '@/store/auth.store';

const GID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '842943328007-1vm692lbekoqsu6nli8jsiquc560dj0p.apps.googleusercontent.com';
const HOME: Record<string, string> = { super_admin: '/dashboard', school_admin: '/school-admin', teacher: '/teacher', student: '/student', parent: '/parent' };
const ERR: Record<string, string> = {
  no_account: 'No account found for this Google email. Ask your school admin to create one.',
  suspended: 'Account suspended, contact your administrator',
  server: 'Sign-in failed. Try again.',
  oauth: 'Google sign-in failed. Try again.',
  parse: 'Sign-in failed. Try again.',
};
const inp = 'w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const btn = 'w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50';

function Inner() {
  const router = useRouter();
  const sp = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
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

  const finish = (d: any) => { setAuth(d.user, d.token, remember); router.push(HOME[d.user.role] || '/dashboard'); };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await api.post('/auth/login', form);
      if (r.data.totp_required) { setPartial(r.data.partial_token); setCode(''); return; }
      finish(r.data);
    } catch (err: any) { setError(err.response?.data?.error || 'Login failed. Check your details and try again.'); }
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

  const perks = [
    [Users, 'One login, every role', 'Admins, teachers, students and parents land on their own dashboard.'],
    [Bot, 'AI Tutor on call', 'Instant help on lessons, any time of day.'],
    [BadgeCheck, 'Verifiable certificates', 'Blockchain-backed proof of achievement.'],
    [ShieldCheck, 'Secure by design', 'Two-factor authentication and Google sign-in supported.'],
  ] as const;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <p className="text-sm text-slate-600">
            New to Edunova? <Link href="/register" className="font-semibold text-blue-600 hover:underline">Create One</Link>
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-16">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{partial ? 'Two-factor verification' : 'Welcome back'}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{partial ? 'Enter the code to finish signing in.' : 'Sign in to continue to your school.'}</p>
          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {!partial ? (
            <>
              <form onSubmit={signIn} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} placeholder="you@school.com" required autoComplete="email" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inp} placeholder="Your password" required autoComplete="current-password" />
                    <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Remember me
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <button type="submit" disabled={loading} className={btn}>{loading ? 'Signing in...' : 'Log In'}</button>
              </form>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" /><span className="text-xs text-slate-400">or</span><div className="h-px flex-1 bg-slate-200" />
              </div>
              <button type="button" onClick={google} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6C12.3 13.5 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.4 28.8A14.5 14.5 0 0 1 9.5 24c0-1.7.3-3.3.9-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.6-5.9c-2 1.4-4.7 2.3-7.6 2.3-6.3 0-11.7-4-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z"/></svg>
                Continue with Google
              </button>
            </>
          ) : (
            <form onSubmit={verify} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{backup ? 'Backup code' : '6-digit authenticator code'}</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-sm tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  inputMode={backup ? 'text' : 'numeric'} maxLength={backup ? 16 : 6} autoComplete="one-time-code" autoFocus required />
              </div>
              <button type="submit" disabled={loading} className={btn}>{loading ? 'Verifying...' : 'Verify'}</button>
              <button type="button" onClick={() => { setBackup(!backup); setCode(''); setError(''); }} className="w-full text-sm font-medium text-blue-600">
                {backup ? 'Use authenticator code' : 'Use a backup code'}
              </button>
              <button type="button" onClick={() => { setPartial(''); setCode(''); setError(''); }} className="w-full text-sm text-slate-500">Back to sign in</button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-slate-500 lg:hidden">
            New to Edunova? <Link href="/register" className="font-semibold text-blue-600">Create One</Link>
          </p>
        </div>

        <aside className="hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-white lg:block">
          <h2 className="text-3xl font-bold tracking-tight">Your school, all in one place.</h2>
          <p className="mt-3 text-blue-100">Classes, results, fees and parent updates, built for African schools.</p>
          <ul className="mt-8 space-y-5">
            {perks.map(([I, t, d]) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15"><I className="h-5 w-5" /></span>
                <span><span className="block font-semibold">{t}</span><span className="text-sm text-blue-100">{d}</span></span>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Inner />
    </Suspense>
  );
}
