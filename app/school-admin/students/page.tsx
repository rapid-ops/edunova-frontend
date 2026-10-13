'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Student { id: number; full_name: string; email: string; suspended_at: string | null; suspension_reason: string | null; }
const errMsg = (e: any) => e?.response?.data?.error || e?.message || 'Request failed';

export default function StudentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const sid = user?.school_id;
  const [list, setList] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [reasonErr, setReasonErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!sid) { setLoading(false); return; }
    try { const r = await api.get(`/schools/${sid}/students`); setList(r.data.students || []); }
    catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }, [sid]);
  useEffect(() => { if (user) load(); }, [user, load]);

  const act = async (id: number, kind: 'suspend' | 'reactivate') => {
    if (kind === 'suspend' && !reason.trim()) { setReasonErr('A reason is required'); return; }
    setBusy(true); setError(''); setOk(''); setReasonErr('');
    try {
      await api.post(`/schools/users/${id}/${kind}`, kind === 'suspend' ? { reason: reason.trim() } : {});
      setOk(kind === 'suspend' ? 'Account suspended.' : 'Account reactivated.');
      setOpenId(null); setReason(''); await load();
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };

  const shown = list.filter((s) => (s.full_name + ' ' + s.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm text-blue-600">← Back</button>
        <h1 className="text-lg font-bold text-gray-900">Students</h1>
      </div>
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
        {ok && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{ok}</div>}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none" />
        {loading ? <p className="text-center text-gray-400 text-sm py-12">Loading...</p>
          : !sid ? <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">No school is linked to this account.</div>
          : shown.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">No students found.</div>
          : shown.map((s) => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{s.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{s.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${s.suspended_at ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{s.suspended_at ? 'Suspended' : 'Active'}</span>
              </div>
              {s.suspended_at && s.suspension_reason && <p className="text-xs text-gray-600 mt-2">Reason: {s.suspension_reason}</p>}
              {openId === s.id ? (
                <div className="mt-3 space-y-2">
                  <input value={reason} onChange={(e) => { setReason(e.target.value); setReasonErr(''); }} placeholder="Reason for suspension" className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none" />
                  {reasonErr && <p className="text-red-600 text-xs">{reasonErr}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => act(s.id, 'suspend')} disabled={busy} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{busy ? 'Working...' : 'Confirm suspend'}</button>
                    <button onClick={() => { setOpenId(null); setReason(''); setReasonErr(''); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  {s.suspended_at
                    ? <button onClick={() => act(s.id, 'reactivate')} disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Reactivate</button>
                    : <button onClick={() => { setOpenId(s.id); setReason(''); setOk(''); }} className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium">Suspend</button>}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
