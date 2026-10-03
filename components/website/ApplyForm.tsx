'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';
const inp = 'w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base text-slate-900';

export default function ApplyForm({ subdomain, programmes, preselect }: { subdomain: string; programmes: string[]; preselect: string }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', programme: preselect, message: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [err, setErr] = useState('');
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const send = async () => {
    setState('sending'); setErr('');
    try {
      const r = await fetch(API + '/apply/' + encodeURIComponent(subdomain), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || 'Could not send. Try again.'); setState('idle'); return; }
      setState('done');
    } catch { setErr('Network error. Try again.'); setState('idle'); }
  };

  if (state === 'done') return <div className="rounded-md bg-emerald-50 p-6 text-center text-emerald-900">Thank you. The admissions office will contact you soon.</div>;
  return (
    <div className="space-y-4">
      <label className="block"><span className="mb-1 block text-sm font-medium">Full name</span><input className={inp} value={f.name} onChange={set('name')} /></label>
      <label className="block"><span className="mb-1 block text-sm font-medium">Email</span><input type="email" className={inp} value={f.email} onChange={set('email')} /></label>
      <label className="block"><span className="mb-1 block text-sm font-medium">Phone (WhatsApp if possible)</span><input type="tel" className={inp} value={f.phone} onChange={set('phone')} /></label>
      {programmes.length > 0 && (
        <label className="block"><span className="mb-1 block text-sm font-medium">Programme</span>
          <select className={inp} value={f.programme} onChange={set('programme')}>
            <option value="">Not sure yet</option>
            {programmes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      )}
      <label className="block"><span className="mb-1 block text-sm font-medium">Message (optional)</span><textarea rows={4} className={inp} value={f.message} onChange={set('message')} /></label>
      <input className="hidden" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button onClick={send} disabled={state === 'sending'} className="inline-flex min-h-11 items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider disabled:opacity-60" style={{ background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-btn)' }}>
        <Send className="h-4 w-4" />{state === 'sending' ? 'Sending...' : 'Send application'}
      </button>
    </div>
  );
}
