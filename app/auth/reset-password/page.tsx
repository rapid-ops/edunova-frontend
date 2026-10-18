'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck, Zap, Headphones } from 'lucide-react';
import api from '@/lib/api';
import { passwordError, passwordStrength } from '@/lib/password';
import AuthShell from '@/components/auth/AuthShell';
import GoogleButton from '@/components/auth/GoogleButton';
import PasswordField from '@/components/auth/PasswordField';
import { Badge, OrDivider, InfoBox } from '@/components/auth/ui';
import { btnCls } from '@/components/auth/styles';

const tiles = [
  { icon: ShieldCheck, title: 'Secure & Protected', text: 'Your data is safe with us. We use industry standard security measures.' },
  { icon: Zap, title: 'Quick & Simple', text: 'Get back to your account in just a few clicks.' },
  { icon: Headphones, title: 'Need Help?', text: "Contact our support team if you're still having trouble." },
];
const bars = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];
const labels = ['Password strength', 'Weak', 'Fair', 'Strong'];
const h1 = 'mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#0b1a4a]';

function Inner() {
  const router = useRouter();
  const token = useSearchParams().get('token') || '';
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'error'>('checking');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const score = passwordStrength(pw);

  useEffect(() => {
    if (!/^[a-f0-9]{64}$/.test(token)) { setStatus('invalid'); return; }
    api.post('/auth/reset-password/validate', { token })
      .then(() => setStatus('valid'))
      .catch((e) => setStatus(e.response?.status === 400 ? 'invalid' : 'error'));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const pe = passwordError(pw);
    if (pe) { setError(pe); return; }
    if (pw !== pw2) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: pw });
      router.replace('/auth/reset-success');
    } catch (err: any) {
      const s = err.response?.status;
      const msg: string = err.response?.data?.error || '';
      if (s === 400 && /link/i.test(msg)) setStatus('invalid');
      else setError(s === 429 ? 'Too many attempts. Please wait a few minutes and try again.' : err.response ? (msg || 'Something went wrong. Try again.') : 'Network error. Check your connection and try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthShell backHref="/auth/login" backLabel="Back to Sign In" caption={['A new', 'beginning', 'is just a', 'password away']} badge="lock" photo="/images/recovery-girl-lock.png" tiles={tiles}>
      <Badge icon={Lock}>Reset Password</Badge>
      {status === 'checking' && <p className="mt-6 text-sm text-slate-500" role="status">Checking your link...</p>}
      {status === 'error' && (
        <>
          <h1 className={h1}>We could not check this link</h1>
          <p className="mb-6 mt-3 text-sm text-slate-500">Check your connection and try again.</p>
          <button type="button" onClick={() => window.location.reload()} className={btnCls}>Try again</button>
        </>
      )}
      {status === 'invalid' && (
        <>
          <h1 className={h1}>This link cannot be used</h1>
          <p className="mb-6 mt-3 text-sm leading-relaxed text-slate-500">The reset link is missing, invalid, already used or expired. Request a new one to continue.</p>
          <Link href="/auth/forgot-password" className={btnCls}>Request a new link</Link>
        </>
      )}
      {status === 'valid' && (
        <>
          <h1 className={h1.replace('text-3xl', 'text-4xl')}>Create a New Password</h1>
          <p className="mb-6 mt-3 text-sm leading-relaxed text-slate-500">Your new password must be strong and secure to keep your account safe.</p>
          {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <PasswordField id="pw" label="New Password" value={pw} onChange={setPw} placeholder="Enter new password" />
            <div className="flex items-center gap-2" aria-live="polite">
              {[1, 2, 3].map((i) => <span key={i} className={`h-1.5 w-9 rounded-full ${score >= i ? bars[score] : 'bg-slate-200'}`} />)}
              <span className="text-xs text-slate-500">{labels[score]}</span>
            </div>
            <PasswordField id="pw2" label="Confirm New Password" value={pw2} onChange={setPw2} placeholder="Confirm new password" />
            <button type="submit" disabled={loading} className={btnCls}>{loading ? 'Resetting...' : 'Reset Password'}{!loading && <ArrowRight className="h-4 w-4" />}</button>
          </form>
          <OrDivider />
          <GoogleButton />
          <InfoBox icon={ShieldCheck}>Your password is encrypted and never shared with anyone. We use industry-standard security measures to protect your account.</InfoBox>
        </>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f9ff]" />}>
      <Inner />
    </Suspense>
  );
}
