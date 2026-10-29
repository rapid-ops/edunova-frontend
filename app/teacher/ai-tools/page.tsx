'use client';
import AiQuizGenerator from '@/components/teacher/AiQuizGenerator';
import AiCourseCreator from '@/components/teacher/AiCourseCreator';
import { useState } from 'react';
import { Sparkles, BookOpen, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

type Tab = 'quiz' | 'course' | 'copilot';

export default function AIToolsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('quiz');
  const [copilotMsgs, setCopilotMsgs] = useState<{ role: string; content: string }[]>([]);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);

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

      {tab === 'quiz' && <AiQuizGenerator />}

      {tab === 'course' && <AiCourseCreator />}

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
