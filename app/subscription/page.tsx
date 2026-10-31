'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

type Plan = { key: string; name: string; price_ngn: number; period_months: number; max_users: number | null; features: string[] };
const per = (m: number) => (m === 1 ? '/month' : m === 12 ? '/yr' : `/${m} months`);

export default function SubscriptionPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => { if (!token) router.replace('/auth/login'); }, [token]);
  useEffect(() => {
    api.get('/subscriptions/plans').then((r) => setPlans(r.data.plans || [])).catch(() => setError('Could not load the plans. Please try again.'));
  }, []);

  async function subscribe(planId: string) {
    setLoading(planId); setError('');
    try {
      const { data } = await api.post('/subscriptions/subscribe', { plan: planId });
      window.location.href = data.authorization_url;
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to initiate payment');
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">Choose a Plan</h1>
        <p className="text-slate-500 text-center mb-8">Paid in NGN via Paystack</p>
        {error && <p className="text-red-500 text-center mb-6">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.key} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-slate-900">{p.name}</h2>
              <p className="text-slate-500 text-sm mb-4">{p.max_users ? `Up to ${p.max_users.toLocaleString('en-NG')} users` : 'Unlimited users'}</p>
              <p className="text-3xl font-extrabold text-blue-600 mb-6">₦{p.price_ngn.toLocaleString()}<span className="text-sm font-normal text-slate-400">{per(p.period_months)}</span></p>
              <ul className="space-y-2 flex-1 mb-6">
                {(p.features || []).map(f => <li key={f} className="text-sm text-slate-600 flex gap-2"><span className="text-green-500">✓</span>{f}</li>)}
              </ul>
              <button onClick={() => subscribe(p.key)} disabled={!!loading} className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
                {loading === p.key ? 'Redirecting…' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
