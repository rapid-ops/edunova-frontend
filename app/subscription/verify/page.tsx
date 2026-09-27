import LoadingScreen from '@/components/LoadingScreen';
'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '@/lib/api';

function SubscriptionVerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get('reference');
  const [status, setStatus] = useState<'loading'|'success'|'failed'>('loading');

  useEffect(() => {
    if (!reference) { setStatus('failed'); return; }
    api.get(`/subscription/verify/${reference}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('failed'));
  }, [reference]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm w-full">
        {status === 'loading' && <><Loader size={48} className="text-blue-600 animate-spin mx-auto mb-4" /><p className="text-gray-600">Activating subscription...</p></>}
        {status === 'success' && <><CheckCircle size={48} className="text-green-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-900 mb-2">Subscription Active</h2><p className="text-gray-500 text-sm mb-6">Your school subscription is now active.</p><button onClick={() => router.push('/school-admin')} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium">Go to Dashboard</button></>}
        {status === 'failed' && <><XCircle size={48} className="text-red-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2><p className="text-gray-500 text-sm mb-6">Could not verify subscription. Contact support.</p><button onClick={() => router.push('/dashboard/b2b-support')} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium">Contact Support</button></>}
      </div>
    </div>
  );
}

export default function SubscriptionVerifyPage() {
  return <Suspense fallback={<LoadingScreen />}><SubscriptionVerifyContent /></Suspense>;
}
