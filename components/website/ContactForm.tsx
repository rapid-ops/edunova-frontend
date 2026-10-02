'use client';
import { useEffect, useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { CONTACT } from '@/lib/contact';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';
const inp = 'w-full rounded-lg border border-slate-300 px-3 py-3 text-base';

export default function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', school_name: '', message: '', website: '' });
  const [sub, setSub] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [err, setErr] = useState('');
  useEffect(() => { setSub(new URLSearchParams(window.location.search).get('school') || ''); }, []);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const send = async () => {
    setState('sending'); setErr('');
    try {
      const r = await fetch(`${API}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, school_subdomain: sub }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || 'Could not send.'); setState('idle'); return; }
      setState('done');
    } catch { setErr('Network error. Try again.'); setState('idle'); }
  };

  if (state === 'done') return <div className="rounded-2xl bg-emerald-50 p-8 text-center text-emerald-800">Thanks. We will reply by email soon.</div>;
  return (
    <div className="space-y-4">
      <input className={inp} placeholder="Your name" value={f.name} onChange={set('name')} />
      <input className={inp} placeholder="Email" type="email" value={f.email} onChange={set('email')} />
      <input className={inp} placeholder="School name" value={f.school_name} onChange={set('school_name')} />
      <textarea className={inp} rows={5} placeholder="Message" value={f.message} onChange={set('message')} />
      <input className="hidden" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button onClick={send} disabled={state === 'sending'} className="flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 font-semibold text-white disabled:opacity-60"><Send className="h-4 w-4" />{state === 'sending' ? 'Sending...' : 'Send message'}</button>
    </div>
  );
}

export function ContactLinks() {
  const wa = CONTACT.whatsapp.replace(/\D/g, '');
  return (
    <div className="space-y-3 text-slate-700">
      {CONTACT.email && <a href={`mailto:${CONTACT.email}`} className="flex min-h-11 items-center gap-2"><Mail className="h-5 w-5 text-blue-600" />{CONTACT.email}</a>}
      {wa && <a href={`https://wa.me/${wa}`} className="flex min-h-11 items-center gap-2"><MessageCircle className="h-5 w-5 text-blue-600" />WhatsApp us</a>}
      {CONTACT.twitter && <a href={CONTACT.twitter} className="block min-h-11 py-2">Twitter / X</a>}
      {CONTACT.instagram && <a href={CONTACT.instagram} className="block min-h-11 py-2">Instagram</a>}
      <div className="flex h-40 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">Map coming soon</div>
    </div>
  );
}
