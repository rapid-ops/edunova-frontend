'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SubscriptionVerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const ref = params.get('reference') || params.get('trxref');
    if (!ref) { setStatus('error'); setMessage('No reference found.'); return; }
    api.get(`/payments/subscription/verify?reference=${ref}`)
      .then(() => { setStatus('success'); setTimeout(() => router.replace('/school-admin/subscription'), 2000); })
      .catch(e => { setStatus('error'); setMessage(e?.response?.data?.message || 'Verification failed.'); });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow p-10 text-center max-w-sm w-full">
        {status === 'loading' && <><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"/><p className="text-slate-600">Verifying payment…</p></>}
        {status === 'success' && <><p className="text-4xl mb-4">✅</p><p className="font-semibold">Subscription activated!</p><p className="text-slate-500 text-sm mt-1">Redirecting…</p></>}
        {status === 'error' && <><p className="text-4xl mb-4">❌</p><p className="font-semibold">Verification failed</p><p className="text-red-500 text-sm mt-1">{message}</p><button onClick={() => router.replace('/subscription')} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Try again</button></>}
      </div>
    </main>
  );
}
