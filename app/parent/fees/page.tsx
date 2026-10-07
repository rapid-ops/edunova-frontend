'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Fee { id: number; description: string; amount: number; due_date: string; status: string; }

export default function ParentFeesPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [fees, setFees] = useState<Fee[]>([]);
  const [tab, setTab] = useState<'pending'|'history'>('pending');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number|null>(null);
  const [error, setError] = useState('');

  useEffect(() => { if (!token) router.replace('/auth/login'); }, [token]);

  useEffect(() => {
    if (!user) return;
    api.get(`/fees/student/${user.id}`)
      .then(r => { setFees(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  async function pay(fee: Fee) {
    if (!user) return;
    setPaying(fee.id); setError('');
    try {
      const { data } = await api.post('/payments/initialize', {
        fee_id: fee.id,
        email: user.email,
        amount: fee.amount,
        student_id: user.id,
        school_id: user.school_id,
      });
      window.location.href = data.authorization_url;
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Payment failed');
      setPaying(null);
    }
  }

  const pending = fees.filter(f => f.status !== 'paid');
  const history = fees.filter(f => f.status === 'paid');
  const displayed = tab === 'pending' ? pending : history;

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Fee Payments</h1>
      <div className="flex gap-2 mb-6">
        {(['pending','history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab===t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-slate-400">Loading…</p>}
      {!loading && displayed.length === 0 && <p className="text-slate-400">No {tab} fees.</p>}
      <div className="space-y-4">
        {displayed.map(f => (
          <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-900">{f.description}</p>
              {f.due_date && <p className="text-sm text-slate-500">Due: {new Date(f.due_date).toLocaleDateString('en-GB')}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600 mb-2">₦{Number(f.amount).toLocaleString()}</p>
              {tab === 'pending' && (
                <button onClick={() => pay(f)} disabled={paying===f.id} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">
                  {paying===f.id ? 'Redirecting…' : 'Pay Now'}
                </button>
              )}
              {tab === 'history' && <span className="text-xs text-green-600 font-semibold">Paid</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
