'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Sub { plan: string; status: string; current_period_end?: string; trial_ends_at?: string; }

export default function AdminSubscriptionPage() {
  const { user } = useAuthStore();
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  function load() {
    if (!user?.school_id) return;
    api.get(`/subscriptions/school/${user.school_id}`)
      .then(r => { setSub(r.data.status === 'none' ? null : r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }
  useEffect(load, [user]);

  async function cancel() {
    if (!user?.school_id || !confirm('Cancel subscription?')) return;
    setCancelling(true);
    await api.post(`/subscriptions/cancel/${user.school_id}`).catch(() => {});
    setCancelling(false);
    load();
  }

  const expiry = sub?.current_period_end || sub?.trial_ends_at;
  const expired = expiry && new Date(expiry) < new Date();

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
          <div className="flex justify-between"><span className="text-slate-500 text-sm">Plan</span><span className="font-semibold capitalize">{sub.plan}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 text-sm">Status</span><span className={`text-sm font-semibold ${expired ? 'text-red-500' : 'text-green-600'}`}>{expired ? 'Expired' : sub.status}</span></div>
          {expiry && <div className="flex justify-between"><span className="text-slate-500 text-sm">Expires</span><span className="text-sm">{new Date(expiry).toLocaleDateString('en-GB')}</span></div>}
          <div className="flex gap-3 pt-2">
            <Link href="/subscription" className="flex-1 text-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Upgrade</Link>
            {sub.status !== 'cancelled' && (
              <button onClick={cancel} disabled={cancelling} className="flex-1 px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-semibold disabled:opacity-50">
                {cancelling ? 'Cancelling…' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
