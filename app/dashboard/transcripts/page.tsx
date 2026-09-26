'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Entry { course_title: string; credits: number; score: number; letter_grade: string; grade_points: number; }
interface Transcript { id: number; gpa: number; cgpa: number; total_credits: number; generated_at: string; semester_name: string; entries: Entry[]; }
export default function TranscriptsPage() {
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/transcripts/student/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setTranscripts(d.transcripts || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const generate = async () => { setGenerating(true); await fetch(`${API}/api/transcripts/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ student_id: user.id, school_id: user.school_id }) }); setGenerating(false); load(); };
  const gradeColor = (g: string) => g === 'A' ? 'text-green-600' : g === 'B' ? 'text-blue-600' : g === 'C' ? 'text-yellow-600' : g === 'D' ? 'text-orange-500' : 'text-red-500';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Transcripts</h1></div>
          <button onClick={generate} disabled={generating} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{generating ? 'Generating...' : 'Generate Transcript'}</button>
        </div>
        {transcripts.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No transcripts yet. Click generate to create one.</div> : transcripts.map(t => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div><div className="font-semibold text-gray-900">{t.semester_name || 'General Transcript'}</div><div className="text-xs text-gray-400">{new Date(t.generated_at).toLocaleDateString()}</div></div>
              <div className="flex gap-6 text-center"><div><div className="text-2xl font-bold text-blue-600">{Number(t.gpa).toFixed(2)}</div><div className="text-xs text-gray-400">GPA</div></div><div><div className="text-2xl font-bold text-gray-900">{Number(t.cgpa).toFixed(2)}</div><div className="text-xs text-gray-400">CGPA</div></div><div><div className="text-2xl font-bold text-gray-900">{Number(t.total_credits).toFixed(1)}</div><div className="text-xs text-gray-400">Credits</div></div></div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left px-6 py-3 text-gray-500 font-medium">Course</th><th className="text-center px-4 py-3 text-gray-500 font-medium">Credits</th><th className="text-center px-4 py-3 text-gray-500 font-medium">Score</th><th className="divide-y divide-gray-100">{t.entries.map((e, i) => (<tr key={i}><td className="px-6 py-3 text-gray-900">{e.course_title}</td><td className="px-4 py-3 text-center text-gray-500">{e.credits}</td><td className="px-4 py-3 text-center text-gray-900">{e.score}%</td><td className={`px-4 py-3 text-center font-bold ${gradeColor(e.letter_grade)}`}>{e.letter_grade}</td><td className="px-4 py-3 text-center text-gray-500">{Number(e.grade_points).toFixed(1)}</td></tr>))}</tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
