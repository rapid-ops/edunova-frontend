'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Payment { id: number; amount: number; fee_title: string; created_at: string; student_name: string; }
interface Summary { total_revenue: string; this_month: string; total_payments: string; payments: Payment[]; }

export default function RevenuePage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.school_id) return;
    api.get(`/payments/revenue/${user.school_id}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  return (
    <main className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Revenue</h1>
      {loading && <p className="text-slate-400">Loading…</p>}
      {data && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Revenue', value: `₦${Number(data.total_revenue).toLocaleString()}` },
              { label: 'This Month', value: `₦${Number(data.this_month).toLocaleString()}` },
              { label: 'Total Payments', value: data.total_payments },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {data.payments.map(p => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900">{p.student_name}</p>
                  <p className="text-xs text-slate-400">{p.fee_title} · {new Date(p.created_at).toLocaleDateString('en-GB')}</p>
                </div>
                <p className="font-bold text-green-600">₦{Number(p.amount).toLocaleString()}</p>
              </div>
            ))}
            {data.payments.length === 0 && <p className="text-slate-400">No payments yet.</p>}
          </div>
        </>
      )}
    </main>
  );
}
