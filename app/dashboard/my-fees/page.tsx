'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { ChevronLeft, Wallet, CheckCircle, Clock } from 'lucide-react';

const naira = (n: any) => `₦${Number(n).toLocaleString()}`;
const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function MyFeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [kids, setKids] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');
  const [fees, setFees] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    let u: any = {};
    try { u = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
    setRole(u.role || '');
    if (u.role === 'student') {
      setStudentId(String(u.id));
    } else if (u.role === 'parent') {
      api.get(`/parent/children/${u.id}`)
        .then(res => {
          const list = res.data.children || [];
          setKids(list);
          if (list.length > 0) setStudentId(String(list[0].id));
          else setLoading(false);
        })
        .catch(() => { setError('Could not load your children'); setLoading(false); });
    } else {
      router.replace('/dashboard/fees');
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;
    setError('');
    api.get(`/fees/student/${studentId}`)
      .then(res => setFees(res.data.fees || []))
      .catch(e => setError(e.response?.data?.error || 'Could not load fees'))
      .finally(() => setLoading(false));
  }, [studentId]);

  const pay = async (feeId: number) => {
    setError(''); setPayingId(feeId);
    try {
      const res = await api.post('/payment/initialize', { fee_id: feeId });
      window.location.href = res.data.authorization_url;
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not start the payment');
      setPayingId(null);
    }
  };

  if (loading) return <LoadingScreen />;

  const owing = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + Number(f.amount), 0);
  const badge = (s: string) =>
    s === 'paid' ? 'bg-green-50 text-green-700' : s === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="text-blue-600"><ChevronLeft size={22} /></button>
        <h1 className="text-lg font-bold">School fees</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {role === 'parent' && kids.length > 1 && (
          <select value={studentId} onChange={e => setStudentId(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm">
            {kids.map(k => <option key={k.id} value={k.id}>{k.full_name}</option>)}
          </select>
        )}

        {role === 'parent' && kids.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">No children are linked to your account</div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}

        {studentId && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <Wallet size={22} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Outstanding</p>
              <p className="text-xl font-bold">{naira(owing)}</p>
            </div>
          </div>
        )}

        {studentId && fees.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">No fees yet</div>
        )}

        {fees.map(f => (
          <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm">{f.description || 'School fees'}</p>
                <p className="text-lg font-bold mt-0.5">{naira(f.amount)}</p>
                {f.due_date && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock size={12} /> Due {fmt(f.due_date)}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${badge(f.status)}`}>{f.status}</span>
            </div>
            {f.status === 'paid' ? (
              <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Paid {f.paid_at ? fmt(f.paid_at) : ''}</p>
            ) : (
              <button onClick={() => pay(f.id)} disabled={payingId === f.id}
                className="w-full bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50">
                {payingId === f.id ? 'Opening payment...' : `Pay ${naira(f.amount)}`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
