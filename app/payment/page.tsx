'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

function PaymentContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);

  useEffect(() => {
    fetchFees();
  }, [user]);

  const fetchFees = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/fees/student/${user.id}`);
      setFees(res.data.fees.filter((f: any) => f.status !== 'paid'));
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handlePay = async (fee: any) => {
    setPaying(fee.id);
    try {
      const res = await api.post('/payment/initialize', {
        fee_id: fee.id,
        email: user?.email,
        amount: fee.amount,
      });
      window.location.href = res.data.authorization_url;
    } catch (err) {
      setPaying(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/student')} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold">Pay Fees</h1>
      </div>
      <div className="max-w-2xl mx-auto p-6">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : fees.length === 0 ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <p className="text-green-400 font-medium">All fees paid</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fees.map((f) => (
              <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{f.description}</h3>
                    <p className="text-2xl font-bold mt-1">₦{Number(f.amount).toLocaleString()}</p>
                    {f.due_date && <p className="text-yellow-400 text-xs mt-1">Due: {new Date(f.due_date).toLocaleDateString()}</p>}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400">{f.status}</span>
                </div>
                <button
                  onClick={() => handlePay(f)}
                  disabled={paying === f.id}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {paying === f.id ? 'Redirecting...' : 'Pay Now'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
