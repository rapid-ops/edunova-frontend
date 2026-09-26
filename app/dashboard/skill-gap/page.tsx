'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Analysis { id: number; gaps: string[]; recommendations: string[]; created_at: string; }
export default function SkillGapPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [cv, setCv] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/skill-gap/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setAnalyses(d.analyses || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const analyze = async () => {
    if (!cv.trim()) return;
    setAnalyzing(true); setResult(null);
    const res = await fetch(`${API}/api/skill-gap/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ student_id: user.id, school_id: user.school_id, cv_text: cv }) });
    const d = await res.json();
    setResult(d.analysis); setAnalyzing(false); load();
  };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Skill Gap Analysis</h1></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <p className="text-sm text-gray-500 mb-3">Paste your CV or work experience and AI will identify your skill gaps.</p>
          <textarea value={cv} onChange={e => setCv(e.target.value)} placeholder="Paste your CV, resume, or work experience here..." rows={6} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none mb-3" />
          <button onClick={analyze} disabled={analyzing} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50">{analyzing ? 'Analyzing...' : 'Analyze Gaps'}</button>
        </div>
        {result && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Analysis Result</h2>
            <div className="mb-4"><h3 className="text-sm font-medium text-red-500 mb-2">Skill Gaps</h3><div className="flex flex-wrap gap-2">{(result.gaps || []).map((g: string, i: number) => <span key={i} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full">{g}</span>)}</div></div>
            <div><h3 className="text-sm font-medium text-blue-600 mb-2">Recommendations</h3><div className="space-y-2">{(result.recommendations || []).map((r: string, i: number) => <div key={i} className="text-sm text-gray-700">• {r}</div>)}</div></div>
          </div>
        )}
        {analyses.length > 0 && <div className="space-y-3">{analyses.map(a => (<div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4"><div className="text-xs text-gray-400 mb-2">{new Date(a.created_at).toLocaleDateString()}</div><div className="flex flex-wrap gap-2">{(a.gaps || []).slice(0, 5).map((g: string, i: number) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{g}</span>)}</div></div>))}</div>}
      </div>
    </div>
  );
}
