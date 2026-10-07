'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Fee { id: number; title: string; amount: number; due_date: string; status: string; }
interface Payment { id: number; amount: number; reference: string; created_at: string; fee_title: string; }

export default function ParentFeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [history, setHistory] = useState<Payment[]>([]);
  const [tab, setTab] = useState<'pending'|'history'>('pending');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number|null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/payments/fees/pending').then(r => setFees(r.data.fees || [])),
      api.get('/payments/fees/history').then(r => setHistory(r.data.payments || [])),
    ]).finally(() => setLoading(false));
  }, []);

  async function pay(feeId: number) {
    setPaying(feeId); setError('');
    try {
      const { data } = await api.post('/payments/fees/initiate', { fee_id: feeId });
      window.location.href = data.authorization_url;
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Payment failed');
      setPaying(null);
    }
  }

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
      {!loading && tab === 'pending' && (
        fees.length === 0 ? <p className="text-slate-400">No pending fees.</p> :
        <div className="space-y-4">
          {fees.map(f => (
            <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900">{f.title}</p>
                <p className="text-sm text-slate-500">Due: {new Date(f.due_date).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600 mb-2">₦{Number(f.amount).toLocaleString()}</p>
                <button onClick={() => pay(f.id)} disabled={paying===f.id} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">
                  {paying===f.id ? 'Redirecting…' : 'Pay Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && tab === 'history' && (
        history.length === 0 ? <p className="text-slate-400">No payment history.</p> :
        <div className="space-y-3">
          {history.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-900">{p.fee_title}</p>
                <p className="text-xs text-slate-400">{p.reference} · {new Date(p.created_at).toLocaleDateString('en-GB')}</p>
              </div>
              <p className="font-bold text-green-600">₦{Number(p.amount).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
