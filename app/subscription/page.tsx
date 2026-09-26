'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const PLANS = [
  { key: 'basic', name: 'Basic', price: '₦5,000/mo', description: 'Up to 100 students', features: ['All core features', 'Attendance & fees', 'Messaging', 'Report cards'] },
  { key: 'standard', name: 'Standard', price: '₦15,000/mo', description: 'Up to 500 students', features: ['Everything in Basic', 'Bulk import', 'WhatsApp notifications', 'Priority support'] },
  { key: 'premium', name: 'Premium', price: '₦30,000/mo', description: 'Unlimited students', features: ['Everything in Standard', 'Multiple schools', 'Custom branding', 'Dedicated support'] },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await api.get('/subscription/school/1');
      setSubscription(res.data.subscription);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: string) => {
    setPaying(plan);
    try {
      const res = await api.post('/subscription/subscribe', {
        school_id: 1,
        plan,
        email: user?.email,
      });
      window.location.href = res.data.authorization_url;
    } catch (err) {
      setPaying('');
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'text-green-400';
    if (status === 'trial') return 'text-blue-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-900">←</button>
        <h1 className="text-xl font-bold">Subscription</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {subscription && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <p className="text-gray-500 text-sm">Current Status</p>
            <p className={`text-xl font-bold capitalize mt-1 ${getStatusColor(subscription.status)}`}>
              {subscription.status} — {subscription.plan} plan
            </p>
            {subscription.status === 'trial' && subscription.trial_ends_at && (
              <p className="text-gray-500 text-sm mt-1">
                Trial ends: {new Date(subscription.trial_ends_at).toLocaleDateString()}
              </p>
            )}
            {subscription.status === 'active' && subscription.current_period_end && (
              <p className="text-gray-500 text-sm mt-1">
                Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Choose a Plan</h2>
            {PLANS.map((plan, i) => (
              <div key={plan.key} className={`bg-white border rounded-xl p-6 ${i === 1 ? 'border-blue-500' : 'border-gray-200'}`}>
                {i === 1 && <p className="text-blue-400 text-xs font-medium mb-2">MOST POPULAR</p>}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-gray-500 text-sm">{plan.description}</p>
                  </div>
                  <p className="text-xl font-bold text-blue-400">{plan.price}</p>
                </div>
                <div className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <p key={f} className="text-gray-600 text-sm">✓ {f}</p>
                  ))}
                </div>
                <button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={paying === plan.key || subscription?.plan === plan.key && subscription?.status === 'active'}
                  className={`w-full py-3 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                    i === 1
                      ? 'bg-blue-600 hover:bg-blue-700 text-gray-900'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {paying === plan.key ? 'Redirecting...' :
                   subscription?.plan === plan.key && subscription?.status === 'active' ? 'Current Plan' :
                   'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
