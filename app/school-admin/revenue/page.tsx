'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Summary { total_revenue: number; this_month: number; total_payments: number; }
interface Payment { id: number; amount: number; reference: string; created_at: string; student_name: string; fee_title: string; }

export default function RevenuePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/payments/revenue/summary').then(r => setSummary(r.data)),
      api.get('/payments/revenue/history').then(r => setPayments(r.data.payments || [])),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Revenue</h1>
      {loading && <p className="text-slate-400">Loading…</p>}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: `₦${Number(summary.total_revenue).toLocaleString()}` },
            { label: 'This Month', value: `₦${Number(summary.this_month).toLocaleString()}` },
            { label: 'Total Payments', value: summary.total_payments },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {payments.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-slate-900">{p.student_name}</p>
              <p className="text-xs text-slate-400">{p.fee_title} · {p.reference} · {new Date(p.created_at).toLocaleDateString('en-GB')}</p>
            </div>
            <p className="font-bold text-green-600">₦{Number(p.amount).toLocaleString()}</p>
          </div>
        ))}
        {!loading && payments.length === 0 && <p className="text-slate-400">No payments yet.</p>}
      </div>
    </main>
  );
}
