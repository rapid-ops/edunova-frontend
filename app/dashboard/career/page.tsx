'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Match { id: number; job_title: string; company: string; match_score: number; matched_competencies: string[]; job_url: string; }
export default function CareerPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/career/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setMatches(d.matches || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const findMatches = async () => { setMatching(true); await fetch(`${API}/api/career/match`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ student_id: user.id, school_id: user.school_id }) }); setMatching(false); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Career Matches</h1></div>
          <button onClick={findMatches} disabled={matching} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{matching ? 'Finding...' : 'Find Matches'}</button>
        </div>
        {matches.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400"><div className="text-4xl mb-3">💼</div><p className="text-sm">No career matches yet. Click Find Matches to generate recommendations based on your competencies.</p></div>
        ) : (
          <div className="space-y-4">
            {matches.map(m => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div><div className="font-semibold text-gray-900">{m.job_title}</div><div className="text-sm text-gray-500">{m.company}</div></div>
                  <div className="text-right"><div className="text-2xl font-bold text-blue-600">{Math.round(m.match_score)}%</div><div className="text-xs text-gray-400">match</div></div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">{(m.matched_competencies || []).map((c: string, i: number) => <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{c}</span>)}</div>
                {m.job_url && <a href={m.job_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View Job →</a>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
