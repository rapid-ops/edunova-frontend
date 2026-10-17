'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, X, UserCheck, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';

type P = { id: number; full_name: string; email: string; phone: string | null; role: string; school_name?: string; created_at: string };
const LABEL: Record<string, string> = { student: 'Student', teacher: 'Teacher', parent: 'Parent' };

export default function ApprovalsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [rowErr, setRowErr] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setError('');
    try { const r = await api.get('/approvals/pending'); setUsers(r.data.users || []); }
    catch (e: any) { setError(e.response?.data?.error || 'Could not load pending accounts.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const fail = (id: number, e: any) => {
    setRowErr((m) => ({ ...m, [id]: e.response?.data?.error || 'Something went wrong. Try again.' }));
    if (e.response?.status === 409) load();
  };
  const approve = async (id: number) => {
    setBusy(id); setRowErr((m) => ({ ...m, [id]: '' }));
    try { await api.put(`/approvals/${id}/approve`); setUsers((u) => u.filter((x) => x.id !== id)); }
    catch (e: any) { fail(id, e); }
    finally { setBusy(null); }
  };
  const reject = async (id: number) => {
    if (reason.trim().length < 3) { setRowErr((m) => ({ ...m, [id]: 'Give a reason of at least 3 characters.' })); return; }
    setBusy(id); setRowErr((m) => ({ ...m, [id]: '' }));
    try { await api.put(`/approvals/${id}/reject`, { reason: reason.trim() }); setUsers((u) => u.filter((x) => x.id !== id)); setRejecting(null); setReason(''); }
    catch (e: any) { fail(id, e); }
    finally { setBusy(null); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Back" className="flex h-11 w-11 items-center justify-center"><ChevronLeft size={22} className="text-blue-600" /></button>
        <div><h1 className="text-lg font-bold">Approvals</h1><p className="text-xs text-gray-400">{users.length} waiting</p></div>
      </div>
      <div className="px-4 py-4 space-y-3">
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error} <button onClick={() => { setLoading(true); load(); }} className="ml-2 font-semibold underline">Retry</button>
          </div>
        )}
        {!error && users.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <UserCheck size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No accounts are waiting for approval.</p>
          </div>
        )}
        {users.map((u) => (
          <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{u.full_name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 break-all"><Mail size={12} className="shrink-0" />{u.email}</p>
                {u.phone && <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500"><Phone size={12} className="shrink-0" />{u.phone}</p>}
                <p className="mt-1 text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('en-NG')}{u.school_name ? ` - ${u.school_name}` : ''}</p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">{LABEL[u.role] || u.role}</span>
            </div>
            {rejecting === u.id ? (
              <div className="mt-3 space-y-2">
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={500} placeholder="Reason shown to the applicant" aria-label="Rejection reason" className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-red-200" />
                <div className="flex gap-2">
                  <button onClick={() => reject(u.id)} disabled={busy === u.id} className="flex-1 min-h-[44px] bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{busy === u.id ? 'Rejecting...' : 'Confirm reject'}</button>
                  <button onClick={() => { setRejecting(null); setReason(''); }} className="flex-1 min-h-[44px] bg-gray-100 text-gray-600 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <button onClick={() => approve(u.id)} disabled={busy === u.id} className="flex-1 min-h-[44px] bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"><Check size={16} />{busy === u.id ? 'Working...' : 'Approve'}</button>
                <button onClick={() => { setRejecting(u.id); setReason(''); setRowErr((m) => ({ ...m, [u.id]: '' })); }} disabled={busy === u.id} className="flex-1 min-h-[44px] border border-red-200 text-red-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"><X size={16} />Reject</button>
              </div>
            )}
            {rowErr[u.id] && <p role="alert" className="mt-2 text-xs text-red-600">{rowErr[u.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
