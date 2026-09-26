'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Message { role: string; content: string; }
export default function AITutorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const course_id = params.get('course_id');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  useEffect(() => {
    if (!course_id) return;
    fetch(`${API}/api/ai-tutor/session/${user.id}/${course_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { if (d.session) { setSessionId(d.session.id); setMessages(d.session.messages || []); } });
  }, [course_id]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(m => [...m, userMsg]); setInput(''); setLoading(true);
    const res = await fetch(`${API}/api/ai-tutor/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ student_id: user.id, course_id: Number(course_id), message: input }) });
    const d = await res.json();
    setMessages(m => [...m, { role: 'assistant', content: d.reply }]); setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-lg font-bold">AI Tutor</h1><span className="text-xs text-gray-400">Answers based on your course content only</span></div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.length === 0 && <div className="text-center text-gray-400 mt-12"><div className="text-4xl mb-3">🤖</div><p className="text-sm">Ask me anything about your course.</p></div>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-400">Thinking...</div></div>}
        <div ref={bottom} />
      </div>
      <div className="border-t border-gray-200 bg-white px-6 py-4 max-w-3xl mx-auto w-full">
        <div className="flex gap-3"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask a question about your course..." className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" /><button onClick={send} disabled={loading} className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm disabled:opacity-50">Send</button></div>
      </div>
    </div>
  );
}
