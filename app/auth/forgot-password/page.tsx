'use client';
import { useState } from 'react';
import { Lock, Mail, Send, Info, ShieldCheck, Clock } from 'lucide-react';
import api from '@/lib/api';
import AuthShell from '@/components/auth/AuthShell';
import GoogleButton from '@/components/auth/GoogleButton';
import { Badge, OrDivider, InfoBox } from '@/components/auth/ui';
import { fieldCls, iconBoxCls, inputCls, btnCls } from '@/components/auth/styles';

const tiles = [
  { icon: Mail, title: 'Check Your Email', text: "We'll send a secure reset link to your inbox." },
  { icon: ShieldCheck, title: 'Keep Your Account Safe', text: 'Your information is always protected.' },
  { icon: Clock, title: 'Quick & Easy', text: 'Get back to learning in just a few clicks.' },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setSent(false);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err: any) {
      const s = err.response?.status;
      setError(s === 429 ? 'Too many requests. Please wait a few minutes and try again.'
        : err.response ? (err.response.data?.error || 'Something went wrong. Try again.')
        : 'Network error. Check your connection and try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthShell backHref="/auth/login" backLabel="Back to Sign In" caption={['Your', 'Learning', 'Journey', 'Continues']} photo="/images/hero-students.png" tiles={tiles}>
      <Badge icon={Lock}>Account Recovery</Badge>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#0b1a4a]">Forgot Your Password?</h1>
      <p className="mb-6 mt-3 text-sm leading-relaxed text-slate-500">No worries! Enter your email address and we&apos;ll send you a link to reset your password.</p>
      {sent && <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.</div>}
      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0b1a4a]">Email Address <span className="text-red-500">*</span></label>
          <div className={fieldCls}>
            <span className={iconBoxCls}><Mail className="h-4 w-4" /></span>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="Enter your email address" required autoComplete="email" />
          </div>
        </div>
        <button type="submit" disabled={loading} className={btnCls}><Send className="h-4 w-4" />{loading ? 'Sending...' : 'Send Reset Link'}</button>
      </form>
      <OrDivider />
      <GoogleButton />
      <InfoBox icon={Info}>You&apos;ll receive an email with instructions on how to reset your password. Check your spam folder if you don&apos;t see it.</InfoBox>
    </AuthShell>
  );
}
