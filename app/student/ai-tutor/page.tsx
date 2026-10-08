'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function AITutorPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [twin, setTwin] = useState<any>(null);
  const [lang, setLang] = useState('English');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/enrollments/student/${user.id}`).then(r => setCourses(r.data.enrollments || [])).catch(() => {});
    api.get(`/ai/learning-twin/${user.id}`).then(r => setTwin(r.data.twin)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!courseId || !user?.id) return;
    api.get(`/ai-tutor/session/${user.id}/${courseId}`).then(r => setMessages(r.data.session?.messages || [])).catch(() => {});
  }, [courseId, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !courseId) return;
    const msg = input;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    try {
      const r = await api.post('/ai-tutor/chat', { student_id: user?.id, course_id: courseId, message: msg });
      let reply = r.data.reply;
      if (lang !== 'English') {
        const t = await api.post('/ai/translate', { text: reply, target_language: lang });
        reply = t.data.translated;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error getting response.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <div className="flex flex-col flex-1 bg-white rounded-xl border overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b">
          <Bot className="text-blue-600" size={22} />
          <h1 className="font-semibold">AI Tutor</h1>
          <select className="ml-auto border rounded px-2 py-1 text-sm" value={courseId} onChange={e => setCourseId(e.target.value)}>
            <option value="">Select course</option>
            {courses.map((e: any) => (
              <option key={e.course_id} value={e.course_id}>{e.course_title || e.course_id}</option>
            ))}
          </select>
          <select className="border rounded px-2 py-1 text-sm" value={lang} onChange={e => setLang(e.target.value)}>
            {['English', 'Yoruba', 'Hausa', 'Igbo', 'French'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!courseId && <p className="text-gray-400 text-sm text-center mt-8">Select a course to start.</p>}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && <Bot size={18} className="text-blue-500 mt-1 shrink-0" />}
              <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {m.role === 'assistant' ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
              </div>
              {m.role === 'user' && <User size={18} className="text-gray-400 mt-1 shrink-0" />}
            </div>
          ))}
          {loading && <p className="text-gray-400 text-sm animate-pulse">Thinking...</p>}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 p-4 border-t">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={courseId ? 'Ask your tutor...' : 'Select a course first'}
            disabled={!courseId || loading}
          />
          <button onClick={send} disabled={!courseId || loading || !input.trim()} className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-40">
            <Send size={18} />
          </button>
        </div>
      </div>
      {twin && (
        <div className="w-60 bg-white rounded-xl border p-4 space-y-3 text-sm overflow-y-auto shrink-0">
          <h2 className="font-semibold flex items-center gap-2"><BookOpen size={15} />Learning Twin</h2>
          <div><p className="text-gray-400 text-xs mb-1">Strengths</p><p>{twin.profile?.strengths?.join(', ') || '—'}</p></div>
          <div><p className="text-gray-400 text-xs mb-1">Weaknesses</p><p>{twin.profile?.weaknesses?.join(', ') || '—'}</p></div>
          <div><p className="text-gray-400 text-xs mb-1">Preferred type</p><p>{twin.profile?.preferred_content_type || '—'}</p></div>
          <div><p className="text-gray-400 text-xs mb-1">Pace</p><p>{twin.profile?.pace || '—'}</p></div>
        </div>
      )}
    </div>
  );
}
