'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock } from 'lucide-react';
import api from '@/lib/api';
import { passwordError, passwordStrength } from '@/lib/password';
import { useAuthStore } from '@/store/auth.store';

const HOME: Record<string, string> = { super_admin: '/dashboard', school_admin: '/school-admin', teacher: '/teacher', student: '/student', parent: '/parent' };
const field = 'flex items-center overflow-hidden rounded-xl border border-blue-100 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100';
const input = 'h-12 w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400';

export default function SetPasswordPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [waited, setWaited] = useState(false);
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { const t = setTimeout(() => setWaited(true), 800); return () => clearTimeout(t); }, []);

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-blue-50/40 p-6 text-center">
        <p className="text-sm text-slate-600">{waited ? 'Please sign in first, then choose your password.' : 'Loading...'}</p>
        {waited && <Link href="/auth/login" className="text-sm font-semibold text-blue-600">Go to sign in</Link>}
      </div>
    );
  }

  const strength = passwordStrength(pw);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!code.trim()) { setErr('Enter the one-time code you were given.'); return; }
    const pe = passwordError(pw);
    if (pe) { setErr(pe); return; }
    if (pw !== pw2) { setErr('The two passwords do not match.'); return; }
    setBusy(true);
    try {
      const r = await api.put('/auth/password/' + user.id, { current_password: code.trim(), new_password: pw });
      if (r.data.token) setAuth({ ...user, must_change_password: false } as any, r.data.token, false);
      router.replace(HOME[user.role] || '/dashboard');
    } catch (ex: any) {
      const m: string = ex.response?.data?.error || '';
      setErr(/incorrect|invalid/i.test(m) ? 'That code is not right. Check it and try again.' : m || 'We could not save your password. Check your internet connection and try again.');
    } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50/40 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-lg" noValidate>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Choose your password</h1>
          <p className="mt-1 text-sm text-slate-600">Welcome, {user.full_name}. Use the one-time code your school gave you, then choose a password only you know. The code stops working once you save it.</p>
        </div>
        {err && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{err}</p>}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">One-time code</span>
          <div className={field}><input className={`${input} font-mono uppercase tracking-widest`} value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" autoCapitalize="characters" /></div>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">New password</span>
          <div className={field}>
            <input type={show ? 'text' : 'password'} className={input} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="px-4 text-slate-500">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <span className="mt-1 block text-xs text-slate-500">At least 8 characters with a letter and a number.{pw ? ` Strength: ${['', 'weak', 'good', 'strong'][strength]}.` : ''}</span>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Type the new password again</span>
          <div className={field}><input type={show ? 'text' : 'password'} className={input} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
        </label>
        <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f63f5] text-sm font-semibold text-white disabled:opacity-50"><Lock size={16} />{busy ? 'Saving...' : 'Save my password'}</button>
      </form>
    </div>
  );
}
