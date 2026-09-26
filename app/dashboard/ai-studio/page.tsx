'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Generation { id: number; prompt: string; status: string; generated_outline: any; created_at: string; created_by_name: string; }
export default function AIStudioPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/ai-courses/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setGenerations(d.generations || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    await fetch(`${API}/api/ai-courses/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ school_id: user.school_id, created_by: user.id, prompt, source_type: 'prompt' }) });
    setPrompt(''); setGenerating(false); setTimeout(load, 3000);
  };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">AI Course Studio</h1></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <p className="text-sm text-gray-500 mb-3">Describe a course and AI will generate a full outline with modules and lessons.</p>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. Introduction to Python programming for secondary school students..." rows={3} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none mb-3" />
          <button onClick={generate} disabled={generating} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50">{generating ? 'Generating...' : 'Generate Course'}</button>
        </div>
        <div className="space-y-4">
          {generations.map(g => (
            <div key={g.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
                <div><div className="font-medium text-gray-900 truncate">{g.prompt}</div><div className="text-xs text-gray-400 mt-1">{g.created_by_name} · {new Date(g.created_at).toLocaleDateString()}</div></div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ml-4 ${g.status === 'done' ? 'bg-green-100 text-green-700' : g.status === 'failed' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-700'}`}>{g.status}</span>
              </div>
              {expanded === g.id && g.generated_outline && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mt-3 mb-1">{g.generated_outline.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{g.generated_outline.description}</p>
                  {(g.generated_outline.modules || []).map((mod: any, i: number) => (
                    <div key={i} className="mb-3"><div className="text-sm font-medium text-gray-900 mb-1">Module {i+1}: {mod.title}</div>{(mod.lessons || []).map((l: any, j: number) => (<div key={j} className="ml-4 text-xs text-gray-500 py-1 border-b border-gray-50">• {l.title} {l.duration_minutes ? `(${l.duration_minutes}min)` : ''}</div>))}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {generations.length === 0 && <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No generations yet. Create your first AI course above.</div>}
        </div>
      </div>
    </div>
  );
}
