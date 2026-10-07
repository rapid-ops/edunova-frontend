'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Sub { plan_id: string; status: string; expires_at: string; }

export default function AdminSubscriptionPage() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/subscription/status')
      .then(r => { setSub(r.data.subscription); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const expired = sub && new Date(sub.expires_at) < new Date();

  return (
    <main className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Subscription</h1>
      {loading && <p className="text-slate-400">Loading…</p>}
      {!loading && !sub && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800 font-medium mb-4">No active subscription</p>
          <Link href="/subscription" className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Choose a Plan</Link>
        </div>
      )}
      {sub && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex justify-between"><span className="text-slate-500 text-sm">Plan</span><span className="font-semibold capitalize">{sub.plan_id}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 text-sm">Status</span><span className={`text-sm font-semibold ${expired ? 'text-red-500' : 'text-green-600'}`}>{expired ? 'Expired' : sub.status}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 text-sm">Expires</span><span className="text-sm">{new Date(sub.expires_at).toLocaleDateString('en-GB')}</span></div>
          {expired && <Link href="/subscription" className="block text-center mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Renew</Link>}
        </div>
      )}
    </main>
  );
}
