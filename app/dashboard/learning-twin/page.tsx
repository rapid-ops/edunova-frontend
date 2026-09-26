'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Twin { id: number; learning_speed: string; best_study_time: string; revision_schedule: any[]; last_analyzed: string; }
export default function LearningTwinPage() {
  const router = useRouter();
  const [twin, setTwin] = useState<Twin | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/learning-twin/${user.id}?school_id=${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setTwin(d.twin); setLoading(false); });
  useEffect(() => { load(); }, []);
  const analyze = async () => { setAnalyzing(true); await fetch(`${API}/api/learning-twin/${user.id}/analyze`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); setAnalyzing(false); load(); };
  const speedColor = (s: string) => s === 'fast' ? 'text-green-600' : s === 'medium' ? 'text-blue-600' : 'text-orange-500';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">My Learning Twin</h1></div>
          <button onClick={analyze} disabled={analyzing} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{analyzing ? 'Analyzing...' : 'Re-Analyze'}</button>
        </div>
        {twin && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 text-center"><div className={`text-2xl font-bold capitalize ${speedColor(twin.learning_speed)}`}>{twin.learning_speed}</div><div className="text-sm text-gray-500 mt-1">Learning Speed</div></div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 text-center"><div className="text-2xl font-bold text-blue-600 capitalize">{twin.best_study_time}</div><div className="text-sm text-gray-500 mt-1">Best Study Time</div></div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Revision Schedule</h2>
              {(twin.revision_schedule || []).length === 0 ? <p className="text-gray-400 text-sm">No schedule yet. Click Re-Analyze.</p> : (
                <div className="space-y-3">{twin.revision_schedule.map((r: any, i: number) => (<div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"><span className="text-sm text-gray-700">{r.day}</span><span className="text-sm font-medium text-blue-600">{r.sessions} session{r.sessions !== 1 ? 's' : ''}</span></div>))}</div>
              )}
            </div>
            <div className="text-xs text-gray-400 text-center">Last analyzed: {twin.last_analyzed ? new Date(twin.last_analyzed).toLocaleString() : 'Never'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
