'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
export default function AnalyticsPage() {
  const router = useRouter();
  const [cohort, setCohort] = useState<any[]>([]);
  const [dropout, setDropout] = useState<any[]>([]);
  const [completion, setCompletion] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    const sid = user.school_id;
    Promise.all([
      fetch(`${API}/api/analytics/cohort/${sid}`, { headers: h }).then(r => r.json()),
      fetch(`${API}/api/analytics/dropout/${sid}`, { headers: h }).then(r => r.json()),
      fetch(`${API}/api/analytics/completion/${sid}`, { headers: h }).then(r => r.json()),
      fetch(`${API}/api/analytics/instructor/${sid}`, { headers: h }).then(r => r.json()),
    ]).then(([c, d, co, i]) => { setCohort(c.data || []); setDropout(d.data || []); setCompletion(co.data || []); setInstructors(i.data || []); setLoading(false); });
  }, []);
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Analytics Dashboard</h1></div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5"><h2 className="font-semibold text-gray-900 mb-4">Weekly Active Students</h2>{cohort.length === 0 ? <p className="text-gray-400 text-sm">No data yet.</p> : cohort.map((c, i) => (<div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"><span className="text-xs text-gray-500">{new Date(c.week).toLocaleDateString()}</span><span className="font-medium text-gray-900">{c.active_students}</span></div>))}</div>
          <div className="bg-white border border-gray-200 rounded-xl p-5"><h2 className="font-semibold text-gray-900 mb-4">Dropout Risk Students</h2>{dropout.length === 0 ? <p className="text-gray-400 text-sm">No at-risk students.</p> : dropout.map((d, i) => (<div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"><div><div className="text-sm font-medium text-gray-900">{d.full_name}</div><div className="text-xs text-gray-400">{d.email}</div></div><span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">{d.events_last_7d} events</span></div>))}</div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5"><h2 className="font-semibold text-gray-900 mb-4">Course Completion Rates</h2>{completion.length === 0 ? <p className="text-gray-400 text-sm">No data yet.</p> : completion.map((c, i) => { const pct = c.enrolled > 0 ? Math.round((c.completed / c.enrolled) * 100) : 0; return (<div key={i} className="mb-3"><div className="flex justify-between text-sm mb-1"><span className="text-gray-700 truncate">{c.title}</span><span className="text-gray-500 ml-2">{pct}%</span></div><div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-blue-600 rounded-full" style={{ width: `${pct}%` }} /></div></div>); })}</div>
          <div className="bg-white border border-gray-200 rounded-xl p-5"><h2 className="font-semibold text-gray-900 mb-4">Instructor Performance</h2>{instructors.length === 0 ? <p className="text-gray-400 text-sm">No data yet.</p> : instructors.map((ins, i) => (<div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"><div><div className="text-sm font-medium text-gray-900">{ins.full_name}</div><div className="text-xs text-gray-400">{ins.courses} courses · {ins.students} students</div></div><span className="text-sm font-medium text-blue-600">{ins.avg_score ? Number(ins.avg_score).toFixed(1) : '--'}%</span></div>))}</div>
        </div>
      </div>
    </div>
  );
}
