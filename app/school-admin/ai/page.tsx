'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Brain, AlertTriangle, MessageSquare, Send, RotateCcw, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { enabledNav, type AdminNavItem } from '@/lib/admin-nav';

type Tab = 'chat' | 'dropout';
type Msg = { role: 'user' | 'assistant'; content: string; error?: boolean };
type Overview = { students: number | null; teachers: number | null; classes: number | null; courses: number | null; published_courses: number | null; at_risk: number | null };

const MARKER = /\[\[page:([^\]]{0,60})\]\]/g;

const greetingWord = () => {
  const h = parseInt(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Africa/Lagos' }).format(new Date()), 10);
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

function Answer({ text, nav, go }: { text: string; nav: AdminNavItem[]; go: (i: AdminNavItem) => void }) {
  const keys = Array.from(new Set(Array.from(text.matchAll(MARKER)).map((m) => m[1].trim())));
  const known = keys.map((k) => nav.find((n) => String(n.key) === k)).filter(Boolean) as AdminNavItem[];
  const body = text.replace(MARKER, '').trim();
  return (
    <div>
      <ReactMarkdown
        skipHtml
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          h1: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
          h2: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
          h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
          a: ({ children }) => <span>{children}</span>,
        }}
      >
        {body}
      </ReactMarkdown>
      {known.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {known.map((i) => (
            <button key={String(i.key)} onClick={() => go(i)} className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg bg-blue-600 text-white text-sm font-medium">
              Open {i.label}<ArrowRight size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SchoolAdminAIPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('chat');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [dropout, setDropout] = useState<any[]>([]);
  const [dropoutLoading, setDropoutLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const nav = useMemo(() => enabledNav(), []);
  const pages = useMemo(() => nav.map((i) => ({ key: i.key, label: i.label })), [nav]);
  const studentsPage = nav.find((i) => i.href.endsWith('/students'));
  const first = (user?.full_name || '').trim().split(/\s+/)[0];
  const go = (i: AdminNavItem) => router.push(i.href);

  useEffect(() => {
    api.get('/ai/school-admin-overview').then((r) => setOverview(r.data.overview)).catch(() => {});
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, loading]);

  const chips = useMemo(() => {
    const c: string[] = [];
    if (overview?.students === 0) c.push('Where do I add a student?');
    c.push('How many students do I have?', 'What courses do I have?');
    if ((overview?.published_courses ?? 0) > 0) c.push('Which courses are published?');
    if ((overview?.at_risk ?? 0) > 0) c.push('Who is at risk?');
    if (overview?.students !== 0) c.push('Where do I add a student?');
    return c.slice(0, 5);
  }, [overview]);

  const ask = async (q: string, history: Msg[]) => {
    setLoading(true);
    try {
      const r = await api.post('/ai/school-admin-query', {
        question: q,
        pages,
        history: history.filter((m) => !m.error).slice(-10).map((m) => ({ role: m.role, content: m.content })),
      });
      setMsgs((p) => [...p, { role: 'assistant', content: String(r.data.reply || '') }]);
    } catch (e: any) {
      const s = e?.response?.status; const server = e?.response?.data?.error;
      const text = !e?.response ? 'Could not reach the server. Check your internet and try again.'
        : [400, 403, 429, 502, 504].includes(s) && typeof server === 'string' ? server
        : 'Something went wrong. Please try again.';
      setMsgs((p) => [...p, { role: 'assistant', content: text, error: true }]);
    } finally { setLoading(false); }
  };

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    const history = msgs;
    setInput('');
    setMsgs((p) => [...p, { role: 'user', content: q }]);
    ask(q, history);
  };

  const retry = () => {
    if (loading) return;
    const idx = msgs.map((m) => m.role).lastIndexOf('user');
    if (idx < 0) return;
    const q = msgs[idx].content;
    const history = msgs.slice(0, idx);
    setMsgs((p) => p.filter((m, i) => !(m.error && i === p.length - 1)));
    ask(q, history);
  };

  const runDropout = async () => {
    setDropoutLoading(true);
    try { const r = await api.post('/ai/predict-dropout', {}); setDropout(r.data.predictions || []); }
    catch { setDropout([]); }
    finally { setDropoutLoading(false); }
  };

  const riskColor = (l: string) =>
    l === 'high' || l === 'critical' ? 'text-red-600 bg-red-50' : l === 'medium' ? 'text-yellow-700 bg-yellow-50' : 'text-green-700 bg-green-50';

  const tabBtn = (k: Tab, label: string, Icon: any) => (
    <button onClick={() => setTab(k)} className={`flex items-center gap-2 min-h-[44px] px-4 rounded-lg text-sm font-medium ${tab === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
      <Icon size={16} />{label}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Brain size={22} className="text-blue-600" />School AI</h1>
      <div className="flex flex-wrap gap-2">
        {tabBtn('chat', 'Ask a question', MessageSquare)}
        {tabBtn('dropout', 'Students at risk', AlertTriangle)}
      </div>

      {tab === 'chat' && (
        <div className="bg-white rounded-xl border flex flex-col overflow-hidden h-[70vh] min-h-[380px]">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {msgs.length === 0 && (
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold">{greetingWord()}{first ? ', ' + first : ''}.</p>
                  <p className="text-sm text-gray-500">Ask me anything about your school.</p>
                </div>
                {overview?.students === 0 && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm space-y-2">
                    <p>You have no students yet. Add your first student.</p>
                    {studentsPage
                      ? <button onClick={() => go(studentsPage)} className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg bg-blue-600 text-white font-medium">Open {studentsPage.label}<ArrowRight size={14} /></button>
                      : <p className="text-gray-600">The students page is not available yet.</p>}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <button key={c} onClick={() => send(c)} className="min-h-[44px] px-4 rounded-full border text-sm text-left text-gray-700 bg-white">{c}</button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[90%] break-words rounded-xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : m.error ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
                  {m.role === 'assistant' && !m.error ? <Answer text={m.content} nav={nav} go={go} /> : m.content}
                  {m.error && i === msgs.length - 1 && (
                    <button onClick={retry} disabled={loading} className="mt-2 flex items-center gap-2 min-h-[44px] px-4 rounded-lg bg-white border border-red-200 text-red-700 font-medium">
                      <RotateCcw size={14} />Try again
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 px-4 py-3 bg-gray-100 rounded-xl w-fit" aria-live="polite" aria-label="The assistant is typing">
                {[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 p-3 border-t">
            <input
              className="flex-1 min-w-0 min-h-[44px] border rounded-lg px-3 text-base"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              placeholder="Ask about your school"
              aria-label="Your question"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send" className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-blue-600 text-white rounded-lg disabled:opacity-40">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {tab === 'dropout' && (
        <div className="bg-white rounded-xl border p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Students at risk</h2>
            <button onClick={runDropout} disabled={dropoutLoading} className="min-h-[44px] px-4 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-40">
              {dropoutLoading ? 'Checking...' : 'Check now'}
            </button>
          </div>
          {!dropout.length && !dropoutLoading && <p className="text-gray-500 text-sm">Tap Check now to see which students may be falling behind.</p>}
          {dropout.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Student</th><th className="pb-2">Risk</th><th className="pb-2">Why</th></tr></thead>
                <tbody className="divide-y">
                  {dropout.map((p, i) => (
                    <tr key={i}>
                      <td className="py-2">{p.student_id}</td>
                      <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColor(p.risk_level)}`}>{p.risk_level}</span></td>
                      <td className="py-2 text-gray-600">{p.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
