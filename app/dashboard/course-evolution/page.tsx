'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Log { id: number; change_type: string; source: string; suggested_update: string; status: string; created_at: string; }
export default function CourseEvolutionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const course_id = params.get('course_id');
  const [logs, setLogs] = useState<Log[]>([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => { if (!course_id) return; fetch(`${API}/api/course-evolution/${course_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setLogs(d.logs || []); setLoading(false); }); };
  useEffect(() => { load(); }, [course_id]);
  const scan = async () => { if (!topic.trim()) return; setScanning(true); await fetch(`${API}/api/course-evolution/scan`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ course_id: Number(course_id), topic }) }); setTopic(''); setScanning(false); load(); };
  const action = async (id: number, type: 'apply' | 'reject') => { await fetch(`${API}/api/course-evolution/${id}/${type}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }); load(); };
  const statusColor = (s: string) => s === 'applied' ? 'bg-green-100 text-green-700' : s === 'rejected' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-700';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Course Evolution</h1></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <p className="text-sm text-gray-500 mb-3">AI scans industry trends and suggests course updates.</p>
          <div className="flex gap-3"><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Python, Machine Learning, Web Development..." className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" /><button onClick={scan} disabled={scanning} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{scanning ? 'Scanning...' : 'Scan Updates'}</button></div>
        </div>
        <div className="space-y-4">
          {logs.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No evolution logs yet.</div> : logs.map(l => (
            <div key={l.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2"><div><div className="font-medium text-sm text-gray-900">{l.change_type}</div><div className="text-xs text-gray-400">{l.source} · {new Date(l.created_at).toLocaleDateString()}</div></div><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(l.status)}`}>{l.status}</span></div>
              <p className="text-sm text-gray-700 mb-3">{l.suggested_update}</p>
              {l.status === 'pending' && <div className="flex gap-2"><button onClick={() => action(l.id, 'apply')} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-lg">Apply</button><button onClick={() => action(l.id, 'reject')} className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-lg">Reject</button></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
