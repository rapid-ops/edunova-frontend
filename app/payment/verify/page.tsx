'use client';
import LoadingScreen from '@/components/LoadingScreen';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '@/lib/api';

function PaymentVerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  const home = () => {
    let role = '';
    try { role = JSON.parse(localStorage.getItem('user') || '{}').role || ''; } catch {}
    router.push(role === 'parent' ? '/parent' : role === 'student' ? '/student' : '/dashboard');
  };

  useEffect(() => {
    if (!reference) { setStatus('failed'); return; }
    api.get(`/payment/verify/${reference}`)
      .then(res => {
        if (res.data && res.data.success === true) setStatus('success');
        else { setMessage(res.data?.message || ''); setStatus('failed'); }
      })
      .catch(e => { setMessage(e.response?.data?.error || ''); setStatus('failed'); });
  }, [reference]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm w-full">
        {status === 'loading' && <><Loader size={48} className="text-blue-600 animate-spin mx-auto mb-4" /><p className="text-gray-600">Verifying payment...</p></>}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful</h2>
            <p className="text-gray-500 text-sm mb-6">Your payment has been confirmed.</p>
            <button onClick={home} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium">Back to Dashboard</button>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Not Confirmed</h2>
            <p className="text-gray-500 text-sm mb-6">{message || 'Something went wrong. If money left your account, contact your school office.'}</p>
            <button onClick={() => router.push('/dashboard/my-fees')} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium">Back to Fees</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return <Suspense fallback={<LoadingScreen />}><PaymentVerifyContent /></Suspense>;
}
