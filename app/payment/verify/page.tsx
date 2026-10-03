'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Printer } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = process.env.NEXT_PUBLIC_API_URL;

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get('reference') || params.get('trxref');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reference) verify();
  }, [reference]);

  async function verify() {
    const res = await fetch(`${API}/api/payment/verify/${reference}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  function printReceipt() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Receipt</title><style>
        body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px}
        .header{text-align:center;border-bottom:2px solid #2563eb;pb:20px;margin-bottom:20px}
        .stamp{font-size:48px;font-weight:900;color:#16a34a;border:4px solid #16a34a;
               display:inline-block;padding:4px 20px;transform:rotate(-15deg);opacity:.7}
        table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px solid #eee}
        td:first-child{font-weight:600;color:#555}
      </style></head><body>
        <div class="header"><h2 style="color:#2563eb">EDUNOVA</h2><h3>Payment Receipt</h3></div>
        <table>
          <tr><td>Student</td><td>${result?.fee?.student_name || user.full_name}</td></tr>
          <tr><td>School</td><td>${result?.fee?.school_name || ''}</td></tr>
          <tr><td>Description</td><td>${result?.fee?.description || 'Fee Payment'}</td></tr>
          <tr><td>Amount Paid</td><td>₦${Number(result?.amount).toLocaleString()}</td></tr>
          <tr><td>Reference</td><td>${reference}</td></tr>
          <tr><td>Date</td><td>${new Date().toLocaleString()}</td></tr>
        </table>
        <div style="text-align:center;margin-top:40px"><span class="stamp">PAID</span></div>
      </body></html>`);
    w.document.close();
    w.print();
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-sm mx-auto px-4 py-12 text-center">
      {result?.success ? (
        <>
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-1">Payment Successful!</h2>
          <p className="text-3xl font-bold text-green-600 mb-2">₦{Number(result.amount).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mb-6">Ref: {reference}</p>
          <button onClick={printReceipt}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 mb-3">
            <Printer size={16} /> Download Receipt
          </button>
          <button onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">
            Back to Dashboard
          </button>
        </>
      ) : (
        <>
          <XCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-sm text-gray-500 mb-6">{result?.reason || 'Something went wrong'}</p>
          <button onClick={() => router.push('/payment')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium">
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense fallback={<LoadingScreen />}><VerifyContent /></Suspense>;
}
