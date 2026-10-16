'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, User, Lock, Eye, EyeOff, LogIn, ShieldCheck, Headphones, Users, BookOpen, BarChart3, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import Logo from '@/components/Logo';
import Photo, { StudentsArt } from '@/components/Photo';
import { hand } from '@/lib/hand';
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
const field = 'flex items-center overflow-hidden rounded-xl border border-blue-100 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100';
const iconBox = 'flex h-12 w-12 shrink-0 items-center justify-center bg-blue-50/70 text-slate-500';
const input = 'h-12 w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400';
const btn = 'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f63f5] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50';

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6C12.3 13.5 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.4 28.8A14.5 14.5 0 0 1 9.5 24c0-1.7.3-3.3.9-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.6-5.9c-2 1.4-4.7 2.3-7.6 2.3-6.3 0-11.7-4-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z"/></svg>
  );
}

function Caption({ className = '' }: { className?: string }) {
  return (
    <p className={`${hand.className} -rotate-6 text-2xl leading-6 text-[#0b1a4a] ${className}`}>
      Better<br />Education<br />Brighter<br />Future
      <svg viewBox="0 0 120 10" className="mt-1 w-24"><path d="M2 7c30-6 70-6 116-2" stroke="#1f63f5" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
    </p>
  );
}

function Inner() {
  const router = useRouter();
  const sp = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
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

  const items = [
    [BookOpen, 'Learn', 'Access courses and resources', 'bg-emerald-400'],
    [BarChart3, 'Track', 'Monitor progress and performance', 'bg-violet-500'],
    [MessageSquare, 'Stay Connected', 'Teachers, students, parents & staff', 'bg-orange-400'],
  ] as const;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f4f9ff] to-[#e9f2ff]">
      <header className="bg-white/80">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Logo size={42} />
          <p className="hidden text-sm text-slate-600 sm:block">Don&apos;t have an account? <Link href="/register" className="font-semibold text-blue-600 hover:underline">Create One</Link></p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,480px)_1fr] lg:py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-[#0b1a4a]">{partial ? 'Two-factor verification' : 'Sign in to your Edunova account'}</h1>
          <p className="mb-6 mt-3 text-sm leading-relaxed text-slate-500">{partial ? 'Enter the code to finish signing in.' : 'Access your courses, manage your school, track progress and stay connected — all in one place.'}</p>
          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {!partial ? (
            <>
              <form onSubmit={signIn} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0b1a4a]">Email Address or Username <span className="text-red-500">*</span></label>
                  <div className={field}>
                    <span className={iconBox}><Mail className="h-4 w-4" /></span>
                    <input type="text" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} placeholder="Enter your email or username" required autoComplete="username" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0b1a4a]">Password <span className="text-red-500">*</span></label>
                  <div className={field}>
                    <span className={iconBox}><Lock className="h-4 w-4" /></span>
                    <input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} placeholder="Enter your password" required autoComplete="current-password" />
                    <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="px-4 text-slate-500 hover:text-slate-700">
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Remember me
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <button type="submit" disabled={loading} className={btn}><LogIn className="h-4 w-4" />{loading ? 'Signing in...' : 'Sign In'}</button>
              </form>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" /><span className="text-xs text-slate-500">or</span><div className="h-px flex-1 bg-slate-200" />
              </div>
              <button type="button" onClick={google} className="flex h-12 w-full items-center justify-center gap-3 rounded-full border-2 border-blue-100 bg-white text-sm font-medium text-[#0b1a4a] hover:bg-blue-50"><GoogleG />Continue with Google</button>
              <p className="mt-6 text-center text-xs text-slate-500">By signing in, you agree to our <Link href="/terms" className="text-blue-600">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600">Privacy Policy</Link>.</p>
            </>
          ) : (
            <form onSubmit={verify} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0b1a4a]">{backup ? 'Backup code' : '6-digit authenticator code'}</label>
                <div className={field}>
                  <span className={iconBox}><User className="h-4 w-4" /></span>
                  <input value={code} onChange={(e) => setCode(e.target.value)} className={input + ' tracking-widest'}
                    inputMode={backup ? 'text' : 'numeric'} maxLength={backup ? 16 : 6} autoComplete="one-time-code" autoFocus required />
                </div>
              </div>
              <button type="submit" disabled={loading} className={btn}>{loading ? 'Verifying...' : 'Verify'}</button>
              <button type="button" onClick={() => { setBackup(!backup); setCode(''); setError(''); }} className="w-full text-sm font-medium text-blue-600">
                {backup ? 'Use authenticator code' : 'Use a backup code'}
              </button>
              <button type="button" onClick={() => { setPartial(''); setCode(''); setError(''); }} className="w-full text-sm text-slate-500">Back to sign in</button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-slate-600 sm:hidden">Don&apos;t have an account? <Link href="/register" className="font-semibold text-blue-600">Create One</Link></p>
        </div>

        <aside className="hidden lg:block">
          <div className="relative overflow-hidden rounded-3xl p-6">
            <div className="absolute inset-0 -z-0 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100/60" />
            <div className="relative z-[1]">
              <Logo size={30} tagline />
              <h2 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight text-[#0b1a4a]">Education<br />made simpler</h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">Manage your school, track progress, access learning resources and stay connected — all in one place.</p>
              <ul className="mt-8 space-y-5">
                {items.map(([I, t, d, c]) => (
                  <li key={t} className="flex items-center gap-4">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${c}`}><I className="h-5 w-5" /></span>
                    <span><span className="block text-sm font-semibold text-[#0b1a4a]">{t}</span><span className="block text-xs text-slate-500">{d}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pointer-events-none absolute bottom-24 right-0 z-0 w-[46%]">
              <Photo src="/images/hero-students.png" alt="Students" className="w-full object-contain" fallback={<StudentsArt className="w-full" />} />
            </div>
            <Caption className="absolute right-6 top-6 z-[1]" />
            <div className="relative z-[1] mt-10 flex max-w-sm items-start gap-3 rounded-2xl bg-white/90 p-4 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><ShieldCheck className="h-5 w-5" /></span>
              <span><span className="block text-sm font-semibold text-[#0b1a4a]">Secure &amp; Trusted</span><span className="block text-xs text-slate-500">Your data is safe with us. We use industry standard security measures.</span></span>
            </div>
          </div>
        </aside>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100/60 px-4 pt-6 lg:hidden">
          <Caption className="absolute right-4 top-4 z-[1]" />
          <Photo src="/images/hero-students.png" alt="Students" className="mx-auto h-64 w-auto object-contain" fallback={<StudentsArt className="mx-auto h-64 w-auto" />} />
        </div>
      </main>

      <footer className="bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:px-8 lg:flex-row">
          <Logo size={30} />
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-600" />Secure Platform</span>
            <span className="flex items-center gap-2"><Headphones className="h-4 w-4 text-blue-600" />24/7 Support</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" />Trusted by Schools</span>
          </div>
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Edunova. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f9ff]" />}>
      <Inner />
    </Suspense>
  );
}
