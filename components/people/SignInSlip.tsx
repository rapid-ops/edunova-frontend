'use client';
import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { copyText, waLink, fmtDate, ghostBtn, SignIn, Invitation } from './common';

export function SignInSlip({ name, s }: { name: string; s: SignIn }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const text = `${s.school_name || 'Your school'} - Edunova sign-in for ${name}\nSchool ID: ${s.login_id}\nOne-time code: ${s.code}\nSign in at ${origin}/auth/login\nUse the code once. You will then choose your own password.${s.expires_at ? '\nThe code works until ' + fmtDate(s.expires_at) + '.' : ''}`;
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
      <p className="text-sm font-semibold text-slate-900">Sign-in details for {name}</p>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-white p-3">
          <dt className="text-xs text-slate-500">School ID</dt>
          <dd className="mt-1 break-all font-mono text-lg font-bold text-slate-900">{s.login_id}</dd>
        </div>
        <div className="rounded-xl bg-white p-3">
          <dt className="text-xs text-slate-500">One-time code</dt>
          <dd className="mt-1 font-mono text-lg font-bold tracking-widest text-slate-900">{s.code}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-slate-600">
        Give these to {name}. The code works once{s.expires_at ? ` and until ${fmtDate(s.expires_at)}` : ''}. When they sign in with it, they will be asked to choose their own password, and the code stops working.
      </p>
      <p className="mt-1 text-xs text-slate-500">Copy the details before you close this screen. The code cannot be shown again.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={async () => setCopied(await copyText(text))} className={ghostBtn}>
          {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy details'}
        </button>
        <a href={waLink(text)} target="_blank" rel="noopener noreferrer" className={ghostBtn}><Share2 size={16} />Share on WhatsApp</a>
      </div>
    </div>
  );
}

export function InviteLinkCard({ name, email, inv }: { name: string; email?: string | null; inv: Invitation }) {
  const [copied, setCopied] = useState(false);
  const text = `Hello ${name}, your school has created your Edunova account. Open this link to choose your password. It works once and for 7 days: ${inv.link}`;
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
      <p className="text-sm font-semibold text-slate-900">Invitation for {name}</p>
      <p className={`mt-1 text-xs ${inv.emailed ? 'text-green-700' : 'text-amber-700'}`}>
        {inv.emailed ? `An email with the link was sent to ${email || 'their address'}.` : 'We could not send the email. Copy the link below and share it on WhatsApp instead.'}
      </p>
      <p className="mt-2 break-all rounded-xl bg-white p-3 text-xs text-slate-700">{inv.link}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={async () => setCopied(await copyText(inv.link))} className={ghostBtn}>
          {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy link'}
        </button>
        <a href={waLink(text)} target="_blank" rel="noopener noreferrer" className={ghostBtn}><Share2 size={16} />Share on WhatsApp</a>
      </div>
    </div>
  );
}
