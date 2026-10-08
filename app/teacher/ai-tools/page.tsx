'use client';
import { useState } from 'react';
import { Sparkles, BookOpen, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

type Tab = 'quiz' | 'course' | 'copilot';

export default function AIToolsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('quiz');
  const [quizForm, setQuizForm] = useState({ course_id: '', topic: '', num_questions: 5, difficulty: 'medium', assessment_id: '' });
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [courseForm, setCourseForm] = useState({ prompt: '', source_type: 'prompt', source_url: '', auto_create: false });
  const [courseResult, setCourseResult] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(false);
  const [copilotMsgs, setCopilotMsgs] = useState<{ role: string; content: string }[]>([]);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);

  const genQuiz = async () => {
    setQuizLoading(true); setQuizResult(null);
    try {
      const r = await api.post('/ai/generate-quiz', { ...quizForm, num_questions: Number(quizForm.num_questions) });
      setQuizResult(r.data);
    } catch (e: any) { setQuizResult({ error: e.response?.data?.error || 'Failed' }); }
    finally { setQuizLoading(false); }
  };

  const genCourse = async () => {
    setCourseLoading(true); setCourseResult(null);
    try {
      const r = await api.post('/ai/generate-course', { ...courseForm, created_by: user?.id, school_id: user?.school_id });
      setCourseResult(r.data);
    } catch (e: any) { setCourseResult({ error: e.response?.data?.error || 'Failed' }); }
    finally { setCourseLoading(false); }
  };

  const sendCopilot = async () => {
    if (!copilotInput.trim()) return;
    const q = copilotInput; setCopilotInput('');
    setCopilotMsgs(prev => [...prev, { role: 'user', content: q }]);
    setCopilotLoading(true);
    try {
      const r = await api.post('/ai/teacher-copilot', { question: q });
      setCopilotMsgs(prev => [...prev, { role: 'assistant', content: r.data.reply }]);
    } catch { setCopilotMsgs(prev => [...prev, { role: 'assistant', content: 'Error.' }]); }
    finally { setCopilotLoading(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Tools</h1>
      <div className="flex gap-2 flex-wrap">
        {([['quiz', 'Quiz Generator', Sparkles], ['course', 'Course Creator', BookOpen], ['copilot', 'Copilot', MessageSquare]] as any[]).map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            <Icon size={15} />{l}
          </button>
        ))}
      </div>

      {tab === 'quiz' && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Generate Quiz</h2>
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded px-3 py-2 text-sm" placeholder="Course ID" value={quizForm.course_id} onChange={e => setQuizForm(p => ({ ...p, course_id: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Assessment ID (optional)" value={quizForm.assessment_id} onChange={e => setQuizForm(p => ({ ...p, assessment_id: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm col-span-2" placeholder="Topic" value={quizForm.topic} onChange={e => setQuizForm(p => ({ ...p, topic: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" type="number" min={1} max={20} value={quizForm.num_questions} onChange={e => setQuizForm(p => ({ ...p, num_questions: Number(e.target.value) }))} />
            <select className="border rounded px-3 py-2 text-sm" value={quizForm.difficulty} onChange={e => setQuizForm(p => ({ ...p, difficulty: e.target.value }))}>
              {['easy', 'medium', 'hard'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={genQuiz} disabled={quizLoading || !quizForm.course_id || !quizForm.topic} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-40">
            {quizLoading ? 'Generating...' : 'Generate'}
          </button>
          {quizResult?.error && <p className="text-red-500 text-sm">{quizResult.error}</p>}
          {quizResult?.questions?.map((q: any, i: number) => (
            <div key={i} className="border rounded p-3 text-sm">
              <p className="font-medium">{i + 1}. {q.question}</p>
              <ul className="mt-1 space-y-0.5">
                {q.options?.map((o: string, j: number) => (
                  <li key={j} className={o === q.correct_answer ? 'text-green-600 font-medium' : 'text-gray-500'}>• {o}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === 'course' && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">AI Course Creator</h2>
          <select className="border rounded px-3 py-2 text-sm w-full" value={courseForm.source_type} onChange={e => setCourseForm(p => ({ ...p, source_type: e.target.value }))}>
            <option value="prompt">From Prompt</option>
            <option value="pdf_text">From PDF Text</option>
            <option value="youtube_url">From YouTube URL</option>
          </select>
          {courseForm.source_type === 'prompt' && (
            <textarea className="border rounded px-3 py-2 text-sm w-full" rows={3} placeholder="Describe the course..." value={courseForm.prompt} onChange={e => setCourseForm(p => ({ ...p, prompt: e.target.value }))} />
          )}
          {courseForm.source_type === 'youtube_url' && (
            <input className="border rounded px-3 py-2 text-sm w-full" placeholder="https://youtube.com/watch?v=..." value={courseForm.source_url} onChange={e => setCourseForm(p => ({ ...p, source_url: e.target.value }))} />
          )}
          {courseForm.source_type === 'pdf_text' && (
            <textarea className="border rounded px-3 py-2 text-sm w-full" rows={4} placeholder="Paste PDF text here..." value={courseForm.source_url} onChange={e => setCourseForm(p => ({ ...p, source_url: e.target.value }))} />
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={courseForm.auto_create} onChange={e => setCourseForm(p => ({ ...p, auto_create: e.target.checked }))} />
            Auto-create course in DB
          </label>
          <button onClick={genCourse} disabled={courseLoading} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-40">
            {courseLoading ? 'Generating...' : 'Generate Course'}
          </button>
          {courseResult?.error && <p className="text-red-500 text-sm">{courseResult.error}</p>}
          {courseResult?.generation && <p className="text-green-600 text-sm">Started — outline will be ready shortly.</p>}
        </div>
      )}

      {tab === 'copilot' && (
        <div className="bg-white rounded-xl border flex flex-col overflow-hidden" style={{ height: '480px' }}>
          <div className="p-4 border-b text-sm font-semibold flex items-center gap-2"><MessageSquare size={15} className="text-blue-600" />Teacher Copilot</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!copilotMsgs.length && <p className="text-gray-400 text-sm">Try: "Which students need intervention?" or "Generate homework for bottom 20%"</p>}
            {copilotMsgs.map((m, i) => (
              <div key={i} className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${m.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{m.content}</div>
            ))}
            {copilotLoading && <p className="text-gray-400 text-sm animate-pulse">Thinking...</p>}
          </div>
          <div className="flex gap-2 p-4 border-t">
            <input className="flex-1 border rounded-lg px-3 py-2 text-sm" value={copilotInput} onChange={e => setCopilotInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCopilot()} placeholder="Ask your copilot..." disabled={copilotLoading} />
            <button onClick={sendCopilot} disabled={copilotLoading || !copilotInput.trim()} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-40">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
