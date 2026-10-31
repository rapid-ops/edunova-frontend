'use client';
import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import api from '@/lib/api';

type Q = { index?: number; question: string; type: string; options?: any; correct_answer?: string; marks: number; explanation?: string; difficulty: string };
type Result = { questions: Q[]; objectives: string[]; lost: number };

const LABEL: Record<string, string> = { mcq: 'Multiple choice', true_false: 'True / False', short_answer: 'Short answer', fill_blank: 'Fill in the blank', matching: 'Matching' };
const ALL = ['mcq', 'true_false', 'short_answer', 'fill_blank', 'matching'];
const LEVELS = ['easy', 'medium', 'hard'];
const box = 'w-full min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900';
const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-50';

const buildSlots = (n: number, types: string[], diff: string) => {
  let e = 0, m = 0, h = 0;
  if (diff === 'mixed') { e = Math.round(n * 0.3); m = Math.round(n * 0.5); h = n - e - m; }
  else if (diff === 'easy') e = n;
  else if (diff === 'medium') m = n;
  else h = n;
  const levels: string[] = [...Array(e).fill('easy'), ...Array(m).fill('medium'), ...Array(h).fill('hard')];
  return levels.map((difficulty, i) => ({ type: types[i % types.length], difficulty }));
};

function Preview({ q }: { q: Q }) {
  if (q.type === 'mcq') {
    return <>{(q.options || []).map((o: string, i: number) => (
      <span key={i} className={`block ${o === q.correct_answer ? 'font-medium text-green-600' : 'text-gray-500'}`}>{o === q.correct_answer ? '✓ ' : '· '}{o}</span>
    ))}</>;
  }
  if (q.type === 'matching') {
    return <>{(q.options || []).map((p: any, i: number) => <span key={i} className="block font-medium text-green-600">{p.left} → {p.right}</span>)}</>;
  }
  if (q.type === 'true_false') return <span className="block font-medium text-green-600">Answer: {q.correct_answer}</span>;
  return <span className="block font-medium text-green-600">Accepted: {String(q.correct_answer || '').split('|').join(', ')}</span>;
}

export default function QuizExamPanel({ quizId, onAdded }: { quizId: string; onAdded: () => void | Promise<void> }) {
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('exam') === '1');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [total, setTotal] = useState('20');
  const [types, setTypes] = useState<string[]>(['mcq', 'true_false', 'short_answer']);
  const [diff, setDiff] = useState('mixed');
  const [flat, setFlat] = useState(false);
  const [wantObj, setWantObj] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const toggleType = (t: string) => setTypes((cur) => (cur.includes(t) ? (cur.length > 1 ? cur.filter((x) => x !== t) : cur) : [...cur, t]));

  const generate = async () => {
    setError(''); setNote(''); setResult(null); setBusy(true);
    const slots = buildSlots(Number(total), types, diff);
    const out: Q[] = [];
    let objectives: string[] = [];
    let lost = 0;
    try {
      for (let i = 0; i < slots.length; i += 10) {
        setProgress(`Writing questions ${Math.min(i + 10, slots.length)} of ${slots.length}...`);
        const chunk = slots.slice(i, i + 10);
        const r = await api.post('/ai/generate-exam', {
          assessment_id: Number(quizId), topic, level, slots: chunk, flat_marks: flat,
          objectives: i === 0 && wantObj, avoid: out.slice(-30).map((q) => q.question.slice(0, 80)),
        });
        const qs: Q[] = r.data.questions || [];
        out.push(...qs);
        lost += chunk.length - qs.length;
        if (i === 0 && Array.isArray(r.data.objectives)) objectives = r.data.objectives;
      }
    } catch (e: any) {
      setError((e?.response?.data?.error || 'The assistant stopped before it finished.') + (out.length ? ' What was written so far is below.' : ''));
    }
    if (out.length) { setResult({ questions: out, objectives, lost }); setPicked(new Set(out.map((_, i) => i))); }
    setBusy(false); setProgress('');
  };

  const chosen = result ? result.questions.filter((_, i) => picked.has(i)) : [];
  const sumMarks = chosen.reduce((s, q) => s + q.marks, 0);

  const add = async () => {
    if (!result || !chosen.length) return;
    setError(''); setBusy(true);
    const list = chosen.map((q) => {
      const o: any = { question: q.question, type: q.type, marks: q.marks, explanation: q.explanation || undefined };
      if (q.type === 'matching' || q.type === 'mcq') o.options = q.options;
      if (q.type !== 'matching') o.correct_answer = q.correct_answer;
      return o;
    });
    try {
      for (let i = 0; i < list.length; i += 25) await api.post(`/quizzes/${quizId}/questions/bulk`, { questions: list.slice(i, i + 25) });
      setNote(`${list.length} questions added to this quiz.`);
      setResult(null);
      await onAdded();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'We could not add the questions. Please try again.');
    }
    setBusy(false);
  };

  const copyObjectives = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')); setNote('Objectives copied. Paste them into the quiz instructions.'); }
    catch { setError('We could not copy. Press and hold the text to copy it.'); }
  };

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setOpen(!open)} className={`${btn} w-full justify-between border border-blue-200 bg-blue-50 text-blue-700`}>
        <span className="flex items-center gap-2"><Sparkles size={16} />Create a full exam with AI</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {note && !open && <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{note}</p>}

      {open && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
          {note && <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{note}</p>}
          {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic, for example Simultaneous equations" aria-label="Topic" className={box} />
          <input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Class level, for example JSS3 (optional)" aria-label="Class level" className={box} />
          <div className="grid grid-cols-2 gap-2">
            <select value={total} onChange={(e) => setTotal(e.target.value)} aria-label="Number of questions" className={box}>
              {['10', '20', '30', '40'].map((n) => <option key={n} value={n}>{n} questions</option>)}
            </select>
            <select value={diff} onChange={(e) => setDiff(e.target.value)} aria-label="Difficulty" className={box}>
              <option value="mixed">Mixed (30% easy, 50% medium, 20% hard)</option>
              <option value="easy">All easy</option>
              <option value="medium">All medium</option>
              <option value="hard">All hard</option>
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Question types</p>
            {ALL.map((t) => (
              <label key={t} className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={types.includes(t)} onChange={() => toggleType(t)} className="h-5 w-5 accent-blue-600" />{LABEL[t]}
              </label>
            ))}
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={!flat} onChange={() => setFlat(!flat)} className="h-5 w-5 accent-blue-600" />Harder questions carry more marks (easy 1, medium 2, hard 3)</label>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={wantObj} onChange={() => setWantObj(!wantObj)} className="h-5 w-5 accent-blue-600" />Also write learning objectives</label>
          <button type="button" onClick={generate} disabled={busy || !topic.trim()} className={`${btn} w-full bg-blue-600 text-white`}>{busy && progress ? progress : 'Write the exam'}</button>

          {result && (
            <div className="space-y-3">
              {result.lost > 0 && <p className="text-sm text-yellow-700">{result.lost} questions could not be written. You can write the exam again to fill the gap.</p>}
              {result.objectives.length > 0 && (
                <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm font-semibold text-gray-900">Learning objectives</p>
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">{result.objectives.map((o, i) => <li key={i}>{o}</li>)}</ol>
                  <button type="button" onClick={copyObjectives} className={`${btn} border border-gray-300 bg-white text-gray-800`}><Copy size={16} />Copy objectives</button>
                </div>
              )}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Marking summary: {chosen.length} questions, {sumMarks} marks</p>
                <p>{ALL.map((t) => ({ t, n: chosen.filter((q) => q.type === t).length })).filter((x) => x.n > 0).map((x) => `${x.n} ${LABEL[x.t].toLowerCase()}`).join(', ')}</p>
                <p>{LEVELS.map((l) => ({ l, n: chosen.filter((q) => q.difficulty === l).length })).filter((x) => x.n > 0).map((x) => `${x.n} ${x.l}`).join(', ')}</p>
              </div>
              <p className="text-xs text-gray-500">Untick any question you do not want. You can edit them after adding.</p>
              {result.questions.map((q, i) => (
                <label key={i} className="flex items-start gap-2 rounded-lg border border-gray-200 p-3 text-sm">
                  <input type="checkbox" checked={picked.has(i)} onChange={() => { const s = new Set(picked); if (s.has(i)) s.delete(i); else s.add(i); setPicked(s); }} className="mt-1 h-5 w-5 shrink-0 accent-blue-600" />
                  <span className="min-w-0">
                    <span className="block text-xs text-gray-400">{LABEL[q.type]} · {q.difficulty} · {q.marks} mark{q.marks === 1 ? '' : 's'}</span>
                    <span className="block font-medium text-gray-900">{q.question}</span>
                    <Preview q={q} />
                  </span>
                </label>
              ))}
              <button type="button" onClick={add} disabled={busy || chosen.length === 0} className={`${btn} w-full bg-blue-600 text-white`}>{busy ? 'Adding...' : `Add ${chosen.length} questions to this quiz`}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
