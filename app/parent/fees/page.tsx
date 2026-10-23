'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Fee { id: number; description: string | null; amount: number | string; due_date: string | null; status: string; student_name?: string }

const naira = (n: number | string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(Number(n));
const payError = (e: any) => {
  const s = e?.response?.status;
  if (s === 409) return 'This fee has already been paid.';
  if (s === 403) return 'You are not allowed to pay this fee.';
  if (s === 404) return 'This fee could not be found.';
  return e?.response?.data?.error || e?.userMessage || 'Payment could not be started. Please try again.';
};

export default function ParentFeesPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [fees, setFees] = useState<Fee[]>([]);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [paying, setPaying] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { if (!token) router.replace('/auth/login'); }, [token, router]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setFailed(false);
    try {
      let kids: { id: number; full_name: string }[] = [];
      if (user.role === 'parent') { const r = await api.get(`/parent/children/${user.id}`); kids = r.data.children || []; }
      else if (user.role === 'student') kids = [{ id: user.id, full_name: user.full_name }];
      const lists = await Promise.all(kids.map(async (k) => {
        const r = await api.get(`/fees/student/${k.id}`);
        return ((r.data.fees || []) as Fee[]).map((f) => ({ ...f, student_name: k.full_name }));
      }));
      setFees(lists.flat());
    } catch { setFailed(true); } finally { setLoading(false); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  async function pay(fee: Fee) {
    setPaying(fee.id); setError('');
    try {
      const { data } = await api.post('/payments/initialize', { fee_id: fee.id });
      window.location.href = data.authorization_url;
    } catch (e: any) {
      setError(payError(e));
      setPaying(null);
      if (e?.response?.status === 409) load();
    }
  }

  const pending = fees.filter((f) => f.status !== 'paid');
  const history = fees.filter((f) => f.status === 'paid');
  const displayed = tab === 'pending' ? pending : history;
  const many = new Set(fees.map((f) => f.student_name)).size > 1;

  return (
    <main className="max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Fee Payments</h1>
      <div className="mb-6 flex gap-2">
        {(['pending', 'history'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`min-h-11 rounded-lg px-4 text-sm font-medium capitalize outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>
        ))}
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-slate-400">Loading...</p>}
      {!loading && failed && (
        <div role="alert" className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="mb-3 text-sm text-slate-600">Could not load your fees.</p>
          <button type="button" onClick={load} className="min-h-11 rounded-lg border border-blue-200 px-5 text-sm font-semibold text-blue-600">Try again</button>
        </div>
      )}
      {!loading && !failed && displayed.length === 0 && <p className="text-slate-400">No {tab} fees.</p>}
      <div className="space-y-4">
        {displayed.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{f.description || 'School fee'}</p>
              {many && f.student_name && <p className="text-sm text-slate-500">{f.student_name}</p>}
              {f.due_date && <p className="text-sm text-slate-500">Due: {new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium' }).format(new Date(f.due_date))}</p>}
            </div>
            <div className="shrink-0 text-right">
              <p className="mb-2 font-bold text-blue-600">{naira(f.amount)}</p>
              {tab === 'pending' && (
                <button type="button" onClick={() => pay(f)} disabled={paying === f.id} className="min-h-11 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50">
                  {paying === f.id ? 'Redirecting...' : 'Pay now'}
                </button>
              )}
              {tab === 'history' && <span className="text-xs font-semibold text-green-600">Paid</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
