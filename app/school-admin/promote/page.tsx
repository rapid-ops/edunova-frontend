'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ArrowRight, CheckCircle } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

export default function PromotePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [previewed, setPreviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [done, setDone] = useState<any>(null);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/classs/school/${user.school_id}`, { headers: h })
      .then(r => r.json()).then(d => { setClasses(d.classes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const doPreview = async () => {
    if (!fromId) return;
    setError(''); setPreview([]);
    const res = await fetch(`${API}/school-admin/promote/preview?class_id=${fromId}`, { headers: h });
    const d = await res.json();
    if (!res.ok) { setError(d.error || 'Failed'); return; }
    setPreview(d.students || []);
    setPreviewed(true);
  };

  const promote = async () => {
    if (!fromId || !toId || !preview.length) return;
    setPromoting(true); setError('');
    const res = await fetch(`${API}/school-admin/promote`, {
      method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: Number(fromId), new_class_id: Number(toId) }),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error || 'Failed'); setPromoting(false); return; }
    setDone(d);
    setPromoting(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
        <h1 className="text-lg font-bold">Grade Promotion</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-700">{done.promoted} students promoted</p>
            <p className="text-sm text-gray-500 mt-1">{done.from?.name} → {done.to?.name}</p>
            <button onClick={() => { setDone(null); setFromId(''); setToId(''); setPreview([]); setPreviewed(false); }}
              className="mt-4 text-sm text-blue-600">Promote another class</button>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">From Class</label>
                <select value={fromId} onChange={e => { setFromId(e.target.value); setPreviewed(false); setPreview([]); }}
                  className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
                  <option value="">Select source class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">To Class</label>
                <select value={toId} onChange={e => setToId(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
                  <option value="">Select destination class</option>
                  {classes.filter(c => String(c.id) !== fromId).map(c =>
                    <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={doPreview} disabled={!fromId}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
                Preview Students
              </button>
            </div>
            {previewed && (
              <>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold">{preview.length} students will be promoted</p>
                  </div>
                  {preview.map(s => (
                    <div key={s.id} className="px-4 py-2.5 border-b border-gray-50 last:border-0">
                      <p className="text-sm text-gray-900">{s.full_name}</p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </div>
                  ))}
                </div>
                {preview.length > 0 && toId && (
                  <button onClick={promote} disabled={promoting}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                    <ArrowRight size={16} />{promoting ? 'Promoting...' : `Confirm Promote ${preview.length} Students`}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
