'use client';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import api from '@/lib/api';
import { errMsg, fieldErrors, inputCls, primaryBtn, ghostBtn } from './common';
import { SignInSlip, InviteLinkCard } from './SignInSlip';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const blank = { full_name: '', email: '', phone: '', p_name: '', p_email: '', p_phone: '' };

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-800">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600" role="alert">{error}</span>}
    </label>
  );
}

export default function AddPersonModal({ role, open, onClose, onCreated }: { role: 'student' | 'teacher'; open: boolean; onClose: () => void; onCreated: () => void }) {
  const word = role === 'student' ? 'student' : 'teacher';
  const cap = word[0].toUpperCase() + word.slice(1);
  const [f, setF] = useState(blank);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [top, setTop] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<any>(null);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setF(blank); setErrs({}); setTop(''); setDone(null); setTimeout(() => first.current?.focus(), 50); }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const anyParent = !!(f.p_name.trim() || f.p_email.trim() || f.p_phone.trim());

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.full_name.trim().length < 2) e.full_name = 'Enter the full name.';
    if (f.email.trim() && !EMAIL.test(f.email.trim())) e.email = 'Enter a valid email address.';
    if (role === 'student' && anyParent) {
      if (f.p_name.trim().length < 2) e.parent_full_name = 'Enter the parent or guardian name.';
      if (!EMAIL.test(f.p_email.trim())) e.parent_email = 'Enter the parent email so we can invite them.';
    }
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrs(e); setTop('');
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const body: any = { role, full_name: f.full_name.trim(), email: f.email.trim() || undefined, phone: f.phone.trim() || undefined };
      if (role === 'student' && anyParent) body.parent = { full_name: f.p_name.trim(), email: f.p_email.trim(), phone: f.p_phone.trim() || undefined };
      const r = await api.post('/people', body);
      setDone(r.data);
      onCreated();
    } catch (err: any) {
      setErrs(fieldErrors(err));
      setTop(errMsg(err));
    } finally { setBusy(false); }
  };

  const again = () => { setF(blank); setErrs({}); setTop(''); setDone(null); setTimeout(() => first.current?.focus(), 50); };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Add a ${word}`}>
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{done ? `${cap} added` : `Add a ${word}`}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>
        {done ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">{done.person.full_name} has been added to your school.</p>
            {done.sign_in && <SignInSlip name={done.person.full_name} s={done.sign_in} />}
            {done.parent && (done.parent.invitation
              ? <InviteLinkCard name={done.parent.full_name} email={f.p_email} inv={done.parent.invitation} />
              : <p className="text-sm text-slate-600">{done.parent.full_name} is already registered at your school and is now linked as parent or guardian.</p>)}
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" onClick={again} className={primaryBtn}>Add another</button>
              <button type="button" onClick={onClose} className={ghostBtn}>Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-3">
            {top && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{top}</p>}
            <Field label="Full name" error={errs.full_name}>
              <input ref={first} className={inputCls} value={f.full_name} onChange={set('full_name')} maxLength={100} autoComplete="off" aria-invalid={!!errs.full_name} />
            </Field>
            <Field label="Email (optional)" error={errs.email} hint="Leave it empty if they do not have one. They will sign in with their school ID.">
              <input type="email" className={inputCls} value={f.email} onChange={set('email')} autoComplete="off" aria-invalid={!!errs.email} />
            </Field>
            <Field label="Phone number (optional)" error={errs.phone} hint="For example 0803 123 4567">
              <input type="tel" className={inputCls} value={f.phone} onChange={set('phone')} autoComplete="off" aria-invalid={!!errs.phone} />
            </Field>
            {role === 'student' && (
              <div className="space-y-3 rounded-2xl border border-blue-100 p-3">
                <p className="text-sm font-semibold text-slate-900">Parent or guardian (optional)</p>
                <Field label="Parent full name" error={errs.parent_full_name}>
                  <input className={inputCls} value={f.p_name} onChange={set('p_name')} maxLength={100} autoComplete="off" />
                </Field>
                <Field label="Parent email" error={errs.parent_email} hint="We email them a link to choose their password.">
                  <input type="email" className={inputCls} value={f.p_email} onChange={set('p_email')} autoComplete="off" />
                </Field>
                <Field label="Parent phone (optional)" error={errs.parent_phone}>
                  <input type="tel" className={inputCls} value={f.p_phone} onChange={set('p_phone')} autoComplete="off" />
                </Field>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="submit" disabled={busy} className={primaryBtn}>{busy ? 'Adding...' : `Add ${word}`}</button>
              <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
