'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const failText = (e: any) => {
  const s = e?.response?.status;
  const m = e?.response?.data?.error;
  if (s === 404) return 'We could not find this payment. If you were charged, contact your school with your Paystack receipt.';
  if (s === 403) return 'This payment belongs to another account.';
  if (s === 400) return m || 'The amount paid does not match this fee. Please contact the school.';
  if (s === 409) return m || 'This fee was already paid another way. Please contact the school about a refund.';
  if (s === 429) return 'Too many requests, please try again shortly';
  return m || 'We could not confirm the payment right now. Please try again shortly.';
};

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(false);
  const back = user?.role === 'student' ? '/dashboard/my-fees' : '/parent/fees';

  const run = useCallback(() => {
    const ref = params.get('reference') || params.get('trxref');
    if (!ref) { setStatus('error'); setMessage('No payment reference was found.'); setRetry(false); return; }
    setStatus('loading');
    api.get(`/payments/verify/${encodeURIComponent(ref)}`)
      .then((r) => {
        if (r.data.success) { setStatus('success'); setMessage(r.data.already_processed ? 'This payment was already confirmed.' : 'Your payment has been recorded.'); setTimeout(() => router.replace(back), 2500); }
        else { setStatus('error'); setMessage(r.data.reason || 'The payment was not completed.'); setRetry(false); }
      })
      .catch((e) => { const s = e?.response?.status; setStatus('error'); setMessage(failText(e)); setRetry(!s || s >= 500); });
  }, [params, router, back]);
  useEffect(() => { run(); }, [run]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 text-center shadow">
        {status === 'loading' && <><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /><p className="text-slate-600">Verifying payment...</p></>}
        {status === 'success' && <><span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-7 w-7" /></span><p className="font-semibold">Payment confirmed</p><p className="mt-1 text-sm text-slate-500">{message}</p><p className="mt-1 text-sm text-slate-500">Returning to your fees...</p></>}
        {status === 'error' && (
          <>
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500"><X className="h-7 w-7" /></span>
            <p className="font-semibold">Payment not confirmed</p>
            <p role="alert" className="mt-1 text-sm text-red-500">{message}</p>
            <div className="mt-4 flex flex-col gap-2">
              {retry && <button type="button" onClick={run} className="min-h-11 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white">Try again</button>}
              <button type="button" onClick={() => router.replace(back)} className="min-h-11 rounded-lg border border-blue-200 px-4 text-sm font-medium text-blue-600">Back to fees</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-sm text-gray-400">Loading...</p></div>}>
      <VerifyInner />
    </Suspense>
  );
}
