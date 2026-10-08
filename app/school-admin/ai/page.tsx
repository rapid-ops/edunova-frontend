'use client';
import { useState } from 'react';
import { Brain, AlertTriangle, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

type Tab = 'chat' | 'dropout';

export default function SchoolAdminAIPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('chat');
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropout, setDropout] = useState<any[]>([]);
  const [dropoutLoading, setDropoutLoading] = useState(false);

  const sendQuery = async () => {
    if (!input.trim()) return;
    const q = input; setInput('');
    setMsgs(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const r = await api.post('/ai/school-admin-query', { question: q });
      setMsgs(prev => [...prev, { role: 'assistant', content: r.data.reply }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Error.' }]);
    } finally { setLoading(false); }
  };

  const runDropout = async () => {
    setDropoutLoading(true);
    try {
      const r = await api.post('/ai/predict-dropout', { school_id: user?.school_id });
      setDropout(r.data.predictions || []);
    } catch { setDropout([]); }
    finally { setDropoutLoading(false); }
  };

  const riskColor = (l: string) =>
    l === 'high' ? 'text-red-600 bg-red-50' :
    l === 'medium' ? 'text-yellow-600 bg-yellow-50' :
    'text-green-600 bg-green-50';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Brain size={22} className="text-blue-600" />School AI
      </h1>
      <div className="flex gap-2">
        <button onClick={() => setTab('chat')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          <MessageSquare size={15} />AI Assistant
        </button>
        <button onClick={() => setTab('dropout')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'dropout' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          <AlertTriangle size={15} />Dropout Risk
        </button>
      </div>

      {tab === 'chat' && (
        <div className="bg-white rounded-xl border flex flex-col overflow-hidden" style={{ height: '480px' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!msgs.length && (
              <div className="text-gray-400 text-sm space-y-1">
                <p>Try:</p>
                <p>• "Students not logged in for 7 days"</p>
                <p>• "Teachers who have not submitted results"</p>
                <p>• "Class performance summary"</p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${m.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {m.content}
              </div>
            ))}
            {loading && <p className="text-gray-400 text-sm animate-pulse">Analyzing...</p>}
          </div>
          <div className="flex gap-2 p-4 border-t">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendQuery()}
              placeholder="Ask about your school..."
              disabled={loading}
            />
            <button onClick={sendQuery} disabled={loading || !input.trim()} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-40">
              Send
            </button>
          </div>
        </div>
      )}

      {tab === 'dropout' && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">At-Risk Students</h2>
            <button onClick={runDropout} disabled={dropoutLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-40">
              {dropoutLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
          {!dropout.length && !dropoutLoading && (
            <p className="text-gray-400 text-sm">Run analysis to see results.</p>
          )}
          {dropout.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Student ID</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dropout.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2">{p.student_id}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColor(p.risk_level)}`}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td className="py-2">{Math.round((p.risk_score || 0) * 100)}%</td>
                    <td className="py-2 text-gray-600">{p.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
