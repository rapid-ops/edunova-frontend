'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import { Send, ArrowLeft, BookOpen, Bot } from 'lucide-react';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

function AITutorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const course_id = params.get('course_id');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const getAuth = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return { token, user };
  };

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || !user.id) { router.push('/auth/login'); return; }

    if (!course_id) {
      fetch(`${API}/enrollments/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).then(d => {
        setCourses(d.enrollments || []);
        setReady(true);
      }).catch(() => setReady(true));
    } else {
      fetch(`${API}/ai-tutor/session/${user.id}/${course_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).then(d => {
        if (d.session?.messages) setMessages(d.session.messages);
        setReady(true);
      }).catch(() => setReady(true));
    }
  }, [course_id]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading || !course_id) return;
    const { token, user } = getAuth();
    const text = input.trim();
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai-tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: user.id, course_id: Number(course_id), message: text }),
      });
      const d = await res.json();
      if (d.reply) {
        setMessages(m => [...m, { role: 'assistant', content: d.reply }]);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: `Error: ${d.error || 'No response'}` }]);
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
  };

  if (!ready) return <LoadingScreen />;

  if (!course_id) return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft size={20} className="text-gray-500" /></button>
        <div className="flex items-center gap-2"><Bot size={18} className="text-blue-600" /><h1 className="text-lg font-bold">AI Tutor</h1></div>
      </div>
      <div className="px-4 py-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Bot size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">Select a course to start. The AI tutor only answers based on your course content.</p>
        </div>
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Choose a course</h2>
        <div className="space-y-3">
          {courses.length === 0 && <p className="text-gray-400 text-sm">No courses enrolled yet.</p>}
          {courses.map(e => (
            <button key={e.course_id} onClick={() => router.push(`/dashboard/ai-tutor?course_id=${e.course_id}`)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 flex items-center gap-3 text-left active:bg-gray-50">
              <BookOpen size={18} className="text-blue-600 shrink-0" />
              <span className="text-sm font-medium text-gray-900">{e.course_title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 text-gray-900 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 shrink-0">
        <button onClick={() => router.push('/dashboard/ai-tutor')}><ArrowLeft size={20} className="text-gray-500" /></button>
        <div className="flex items-center gap-2"><Bot size={18} className="text-blue-600" /><h1 className="text-lg font-bold">AI Tutor</h1></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ paddingBottom: '80px' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4">
              <Bot size={28} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Your AI Tutor</p>
            <p className="text-sm text-gray-400">Ask me anything about your course content.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0" style={{ position: 'fixed', bottom: '60px', left: 0, right: 0 }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your course..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={send} disabled={loading || !input.trim()} className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AITutorPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AITutorContent />
    </Suspense>
  );
}
