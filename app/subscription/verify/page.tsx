'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

export default function SubscriptionVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [plan, setPlan] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) verify(reference);
  }, []);

  const verify = async (reference: string) => {
    try {
      const res = await api.get(`/subscription/verify/${reference}`);
      if (res.data.success) {
        setStatus('success');
        setPlan(res.data.plan);
        setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        setStatus('failed');
      }
    } catch (err) {
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center p-8">
        {status === 'loading' && <p className="text-gray-400 text-lg">Activating subscription...</p>}
        {status === 'success' && (
          <>
            <p className="text-green-400 text-2xl font-bold">Subscription Active!</p>
            <p className="text-gray-400 text-sm mt-2 capitalize">{plan} plan activated</p>
            <p className="text-gray-500 text-sm mt-1">Redirecting to dashboard...</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <p className="text-red-400 text-2xl font-bold">Payment Failed</p>
            <button onClick={() => router.push('/subscription')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
