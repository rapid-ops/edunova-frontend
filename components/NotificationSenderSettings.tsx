'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

// School admin only: choose whether teachers may send notifications.
export default function NotificationSenderSettings() {
  const user = useAuthStore((s) => s.user);
  const admin = user?.role === 'school_admin';
  const [on, setOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!admin) return;
    api.get('/notifications/settings').then((r) => setOn(!!r.data.teachers_can_send)).catch(() => setErr('Could not load this setting'));
  }, [admin]);

  if (!admin) return null;

  const toggle = async () => {
    if (on === null || busy) return;
    const next = !on;
    setBusy(true); setErr(''); setOn(next);
    try { await api.put('/notifications/settings', { teachers_can_send: next }); }
    catch { setOn(!next); setErr('Could not save. Please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <section className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-[#0b1a4a]">Who can send notifications</h2>
      <p className="mt-0.5 text-xs text-slate-500">Administrators can always send. Students and parents cannot.</p>
      <div className="mt-3 flex min-h-11 items-center justify-between gap-3">
        <span className="text-sm text-slate-700">Teachers can send notifications</span>
        <button type="button" role="switch" aria-checked={!!on} aria-label="Teachers can send notifications" disabled={on === null || busy} onClick={toggle}
          className={`relative h-7 w-12 shrink-0 rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 ${on ? 'bg-blue-600' : 'bg-slate-300'}`}>
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>
      {err && <p role="alert" className="mt-2 text-xs text-red-600">{err}</p>}
    </section>
  );
}
