'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Suggestion { id: number; role: string; content: string; status: string; admin_reply: string; created_at: string; }
export default function SuggestionsPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [content, setContent] = useState('');
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAdmin = ['school_admin', 'super_admin'].includes(user.role);
  const load = () => fetch(`${API}/api/suggestions/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setSuggestions(d.suggestions || []); setLoading(false); });
  useEffect(() => { if (isAdmin) load(); else setLoading(false); }, []);
  const submit = async () => { if (!content.trim()) return; await fetch(`${API}/api/suggestions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ school_id: user.school_id, role: user.role, content }) }); setContent(''); alert('Suggestion submitted anonymously.'); };
  const reply = async (id: number) => { if (!replies[id]?.trim()) return; await fetch(`${API}/api/suggestions/${id}/reply`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ admin_reply: replies[id] }) }); setReplies({ ...replies, [id]: '' }); load(); };
  const statusColor = (s: string) => s === 'addressed' ? 'bg-green-100 text-green-700' : s === 'read' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-700';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">{isAdmin ? 'Anonymous Suggestions' : 'Submit Suggestion'}</h1></div>
        {!isAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <p className="text-sm text-gray-500 mb-3">Your suggestion is 100% anonymous. No name or identity is attached.</p>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your suggestion or feedback..." rows={4} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none mb-3" />
            <button onClick={submit} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">Submit Anonymously</button>
          </div>
        )}
        {isAdmin && (
          <div className="space-y-4">
            {suggestions.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No suggestions yet.</div> : suggestions.map(s => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-400 capitalize">{s.role} · {new Date(s.created_at).toLocaleDateString()}</span><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(s.status)}`}>{s.status}</span></div>
                <p className="text-sm text-gray-900 mb-3">{s.content}</p>
                {s.admin_reply && <div className="bg-blue-50 rounded-lg p-3 mb-3"><p className="text-xs text-blue-600 font-medium mb-1">Your reply</p><p className="text-sm text-gray-700">{s.admin_reply}</p></div>}
                {s.status !== 'addressed' && (
                  <div className="flex gap-2"><input value={replies[s.id] || ''} onChange={e => setReplies({ ...replies, [s.id]: e.target.value })} placeholder="Reply to this suggestion..." className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" /><button onClick={() => reply(s.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Reply</button></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
