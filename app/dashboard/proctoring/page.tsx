'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Session { id: number; full_name: string; email: string; status: string; tab_switches: number; started_at: string; ended_at: string; flags: any[]; }
export default function ProctoringPage() {
  const router = useRouter();
  const params = useSearchParams();
  const assessment_id = params.get('assessment_id');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  useEffect(() => {
    if (!assessment_id) return;
    fetch(`${API}/api/proctoring/assessment/${assessment_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setSessions(d.sessions || []); setLoading(false); });
  }, [assessment_id]);
  const flagSession = async (id: number) => { await fetch(`${API}/api/proctoring/${id}/flag-session`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }); setSessions(s => s.map(x => x.id === id ? { ...x, status: 'flagged' } : x)); };
  const statusColor = (s: string) => s === 'flagged' ? 'bg-red-100 text-red-600' : s === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Proctoring Sessions</h1></div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {sessions.length === 0 ? <div className="p-12 text-center text-gray-400">No sessions yet.</div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="text-left px-5 py-3 text-gray-500 font-medium">Student</th><th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th><th className="text-center px-5 py-3 text-gray-500 font-medium">Tab Switches</th><th className="text-center px-5 py-3 text-gray-500 font-medium">Started</th><th className="text-center px-5 py-3 text-gray-500 font-medium">Action</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td className="px-5 py-3"><div className="font-medium text-gray-900">{s.full_name}</div><div className="text-xs text-gray-400">{s.email}</div></td>
                    <td className="px-5 py-3 text-center"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(s.status)}`}>{s.status}</span></td>
                    <td className="px-5 py-3 text-center text-gray-900">{s.tab_switches}</td>
                    <td className="px-5 py-3 text-center text-gray-400 text-xs">{new Date(s.started_at).toLocaleString()}</td>
                    <td className="px-5 py-3 text-center">{s.status !== 'flagged' && <button onClick={() => flagSession(s.id)} className="text-red-400 text-xs hover:text-red-600">Flag</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
