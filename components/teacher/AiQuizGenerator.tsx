'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Trash2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface CourseOption { id: number; title: string; description?: string | null; teacher_id?: number | null; }
type DType = 'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'matching';
interface Pair { left: string; right: string; }
interface Draft {
  type: DType; question: string; options: string[]; answer: number; text: string;
  tf: 'True' | 'False'; pairs: Pair[]; marks: number; explanation: string; difficulty: string;
}

const LABEL: Record<string, string> = { mcq: 'Multiple choice', true_false: 'True / False', short_answer: 'Short answer', fill_blank: 'Fill in the blank', matching: 'Matching' };
const ALL_TYPES = ['mcq', 'true_false', 'short_answer', 'fill_blank', 'matching'];

const field = 'w-full min-h-[44px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500';
const primary = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50';
const secondary = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';

const letterIndex = (s: string, n: number) => {
  const t = s.trim().toLowerCase();
  const i = 'abcdefgh'.indexOf(t);
  return t.length === 1 && i >= 0 && i < n ? i : -1;
};

const buildSlots = (n: number, types: string[], diff: string) => {
  let e = 0, m = 0, h = 0;
  if (diff === 'mixed') { e = Math.round(n * 0.3); m = Math.round(n * 0.5); h = n - e - m; }
  else if (diff === 'easy') e = n;
  else if (diff === 'medium') m = n;
  else h = n;
  const levels: string[] = [...Array(e).fill('easy'), ...Array(m).fill('medium'), ...Array(h).fill('hard')];
  return levels.map((difficulty, i) => ({ type: types[i % types.length], difficulty }));
};

const toDraft = (q: any): Draft | null => {
  const question = String((q && q.question) || '').trim();
  if (!question) return null;
  const base: Omit<Draft, 'type'> = {
    question, options: [], answer: -1, text: '', tf: 'True', pairs: [],
    marks: Math.min(100, Math.max(1, Math.round(Number(q.marks) || 1))),
    explanation: String(q.explanation || ''), difficulty: String(q.difficulty || 'medium'),
  };
  const t = String(q.type || '');
  if (t === 'matching') {
    const pairs: Pair[] = (Array.isArray(q.options) ? q.options : []).map((p: any) => ({ left: String(p && p.left), right: String(p && p.right) }));
    return pairs.length >= 2 ? { ...base, type: 'matching', pairs } : null;
  }
  if (t === 'true_false') return { ...base, type: 'true_false', tf: String(q.correct_answer).toLowerCase() === 'false' ? 'False' : 'True' };
  if (t === 'fill_blank' || t === 'short_answer') return { ...base, type: t, text: String(q.correct_answer === undefined || q.correct_answer === null ? '' : q.correct_answer) };
  const options: string[] = Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : [];
  const correct = String(q.correct_answer === undefined || q.correct_answer === null ? '' : q.correct_answer).trim();
  if (options.length >= 2) {
    let idx = options.findIndex((o) => o.trim().toLowerCase() === correct.toLowerCase());
    if (idx < 0) idx = letterIndex(correct, options.length);
    return { ...base, type: 'mcq', options, answer: idx };
  }
  return { ...base, type: 'short_answer', text: correct };
};

export default function AiQuizGenerator() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseId, setCourseId] = useState('');
  const [notes, setNotes] = useState('');
  const [count, setCount] = useState('10');
  const [types, setTypes] = useState<string[]>(['mcq', 'true_false', 'short_answer']);
  const [diff, setDiff] = useState('mixed');
  const [flat, setFlat] = useState(false);
  const [progress, setProgress] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'saved'>('form');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [savedMarks, setSavedMarks] = useState(0);

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        let list: CourseOption[] = [];
        try {
          const r = await api.get('/courses/mine');
          list = r.data.courses || [];
        } catch {
          const r = await api.get('/courses/school/' + user.school_id);
          list = (r.data.courses || []).filter((c: CourseOption) => Number(c.teacher_id) === Number(user.id));
        }
        setCourses(list);
      } catch {}
      setLoadingCourses(false);
    })();
  }, [user]);

  const toggleType = (t: string) => setTypes((cur) => (cur.includes(t) ? (cur.length > 1 ? cur.filter((x) => x !== t) : cur) : [...cur, t]));
  const patch = (i: number, p: Partial<Draft>) => setDrafts((prev) => prev.map((d, k) => (k === i ? { ...d, ...p } : d)));
  const setOpt = (i: number, j: number, v: string) =>
    setDrafts((prev) => prev.map((d, k) => (k === i ? { ...d, options: d.options.map((o, m) => (m === j ? v : o)) } : d)));
  const setPair = (i: number, j: number, side: 'left' | 'right', v: string) =>
    setDrafts((prev) => prev.map((d, k) => (k === i ? { ...d, pairs: d.pairs.map((p, m) => (m === j ? { ...p, [side]: v } : p)) } : d)));

  const generate = async () => {
    const course = courses.find((c) => String(c.id) === courseId);
    if (!course) { setError('Choose a course first.'); return; }
    const n = Number(count);
    if (!count.trim() || !Number.isFinite(n) || n < 1 || n > 40) { setError('Choose a number of questions from 1 to 40.'); return; }
    setGenerating(true);
    setError('');
    const out: any[] = [];
    let problem = '';
    try {
      let topic = course.title;
      if (course.description) topic += '. ' + course.description.slice(0, 300);
      if (notes.trim()) topic += '. Also consider: ' + notes.trim().slice(0, 500);
      const slots = buildSlots(Math.round(n), types, diff);
      for (let i = 0; i < slots.length; i += 10) {
        setProgress('Writing questions ' + Math.min(i + 10, slots.length) + ' of ' + slots.length + '...');
        const chunk = slots.slice(i, i + 10);
        const r = await api.post('/ai/generate-exam', {
          course_id: Number(courseId), topic, slots: chunk, flat_marks: flat,
          avoid: out.slice(-30).map((q) => String(q.question).slice(0, 80)),
        });
        out.push(...(r.data.questions || []));
      }
    } catch (e: any) {
      problem = e.response?.data?.error || 'We could not finish writing the questions. Please try again in a moment.';
    }
    const list = out.map(toDraft).filter(Boolean) as Draft[];
    if (!list.length) {
      setError(problem || 'We could not make questions this time. Add a little more detail in the box and try again.');
    } else {
      setDrafts(list);
      setTitle(course.title + ' quiz');
      setQuizId(null);
      setError(problem ? problem + ' The questions written so far are below.' : '');
      setStep('review');
    }
    setProgress('');
    setGenerating(false);
  };

  const save = async () => {
    setError('');
    const clean: any[] = [];
    for (let i = 0; i < drafts.length; i++) {
      const d = drafts[i];
      const n = i + 1;
      if (!d.question.trim()) { setError('Question ' + n + ' is empty. Write it or remove it.'); return; }
      const base: any = { question: d.question.trim(), type: d.type, marks: Math.min(100, Math.max(1, Math.round(d.marks || 1))) };
      if (d.explanation.trim()) base.explanation = d.explanation.trim();
      if (d.type === 'mcq') {
        const opts = d.options.map((o) => o.trim());
        if (opts.some((o) => !o)) { setError('Question ' + n + ' has an empty answer choice. Fill it in or remove the question.'); return; }
        if (d.answer < 0) { setError('Choose the correct answer for question ' + n + '.'); return; }
        clean.push({ ...base, options: opts, correct_answer: opts[d.answer] });
      } else if (d.type === 'true_false') {
        clean.push({ ...base, correct_answer: d.tf });
      } else if (d.type === 'matching') {
        const pairs = d.pairs.map((p) => ({ left: p.left.trim(), right: p.right.trim() }));
        if (pairs.length < 2 || pairs.some((p) => !p.left || !p.right)) { setError('Fill in every pair for question ' + n + ' or remove it.'); return; }
        clean.push({ ...base, options: pairs });
      } else {
        if (!d.text.trim()) { setError('Question ' + n + ' needs a correct answer.'); return; }
        clean.push({ ...base, correct_answer: d.text.trim() });
      }
    }
    if (!clean.length) { setError('There are no questions to save.'); return; }
    setSaving(true);
    try {
      let id = quizId;
      if (id === null) {
        const r = await api.post('/quizzes', { course_id: Number(courseId), title: title.trim() || 'Quiz' });
        id = r.data.quiz.id as number;
        setQuizId(id);
      }
      try {
        for (let i = 0; i < clean.length; i += 25) await api.post('/quizzes/' + id + '/questions/bulk', { questions: clean.slice(i, i + 25) });
      } catch (e: any) {
        if (e.response?.status !== 404) throw e;
        for (const q of clean) await api.post('/quizzes/questions', { assessment_id: id, ...q });
      }
      setSavedCount(clean.length);
      setSavedMarks(clean.reduce((s, q) => s + q.marks, 0));
      setStep('saved');
    } catch (e: any) {
      setError(e.response?.data?.error || 'We could not save the quiz. Please try again.');
    }
    setSaving(false);
  };

  const reset = () => { setStep('form'); setDrafts([]); setQuizId(null); setNotes(''); setError(''); };

  if (step === 'saved') {
    return (
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <CheckCircle size={24} className="mt-0.5 shrink-0 text-green-600" />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">Your quiz is saved as a draft</h2>
            <p className="mt-1 text-sm text-gray-600">{savedCount} {savedCount === 1 ? 'question' : 'questions'}, {savedMarks} marks, added to "{title}". Students cannot see it until you publish it.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={'/dashboard/quizzes/' + quizId} className={primary}>Open the quiz</Link>
          <button type="button" onClick={reset} className={secondary}>Make another quiz</button>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    const total = drafts.reduce((s, d) => s + (d.marks || 0), 0);
    return (
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Check your questions</h2>
          <p className="mt-1 text-sm text-gray-600">Change anything you like. Nothing is saved until you press Save as draft quiz.</p>
          <p className="mt-1 text-sm font-medium text-gray-800">{drafts.length} questions, {total} marks in total</p>
        </div>
        <div>
          <label htmlFor="quiz-title" className="mb-1 block text-sm font-medium text-gray-700">Quiz title</label>
          <input id="quiz-title" value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)} className={field} />
        </div>
        <div className="space-y-3">
          {drafts.map((d, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500">Question {i + 1} · {LABEL[d.type]} · {d.difficulty}</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-gray-500">Marks
                    <input type="number" min={1} max={100} value={d.marks} onChange={(e) => patch(i, { marks: Number(e.target.value) || 1 })} className="h-11 w-16 rounded-lg border border-gray-200 px-2 text-sm text-gray-900" />
                  </label>
                  <button type="button" onClick={() => setDrafts(drafts.filter((_, k) => k !== i))} className="inline-flex min-h-[44px] items-center gap-1 px-2 text-xs font-medium text-red-600">
                    <Trash2 size={14} />Remove
                  </button>
                </div>
              </div>
              <textarea value={d.question} rows={2} onChange={(e) => patch(i, { question: e.target.value })} className={field} />
              {d.type === 'mcq' && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-500">Tap the circle next to the correct answer.</p>
                  {d.options.map((o, j) => (
                    <div key={j} className="flex items-center gap-1">
                      <button type="button" aria-label={'Mark choice ' + (j + 1) + ' as the correct answer'} onClick={() => patch(i, { answer: j })} className="flex h-11 w-11 shrink-0 items-center justify-center">
                        <span className={'flex h-6 w-6 items-center justify-center rounded-full border-2 ' + (d.answer === j ? 'border-green-600 bg-green-600' : 'border-gray-300')}>
                          {d.answer === j && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                      </button>
                      <input value={o} onChange={(e) => setOpt(i, j, e.target.value)} className={field} />
                    </div>
                  ))}
                  {d.answer < 0 && <p className="text-xs text-amber-600">Choose the correct answer.</p>}
                </div>
              )}
              {d.type === 'true_false' && (
                <div className="mt-2 flex gap-2">
                  {(['True', 'False'] as const).map((v) => (
                    <button key={v} type="button" onClick={() => patch(i, { tf: v })} className={(d.tf === v ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-700') + ' min-h-[44px] flex-1 rounded-xl border text-sm font-medium'}>
                      {v === d.tf ? 'Correct answer: ' + v : v}
                    </button>
                  ))}
                </div>
              )}
              {(d.type === 'short_answer' || d.type === 'fill_blank') && (
                <div className="mt-2">
                  <label className="mb-1 block text-xs text-gray-500">Correct answer (separate accepted answers with |)</label>
                  <input value={d.text} onChange={(e) => patch(i, { text: e.target.value })} className={field} />
                </div>
              )}
              {d.type === 'matching' && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-500">Each item with its correct match. Students see the matches shuffled.</p>
                  {d.pairs.map((p, j) => (
                    <div key={j} className="flex gap-2">
                      <input value={p.left} onChange={(e) => setPair(i, j, 'left', e.target.value)} className={field} />
                      <input value={p.right} onChange={(e) => setPair(i, j, 'right', e.target.value)} className={field} />
                    </div>
                  ))}
                </div>
              )}
              <input value={d.explanation} onChange={(e) => patch(i, { explanation: e.target.value })} placeholder="Explanation shown after submitting (optional)" className={field + ' mt-2'} />
            </div>
          ))}
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={save} disabled={saving} className={primary}>{saving ? 'Saving...' : 'Save as draft quiz'}</button>
          <button type="button" onClick={generate} disabled={saving || generating} className={secondary}>{generating ? progress || 'Making new questions...' : 'Make new questions'}</button>
          <button type="button" onClick={reset} disabled={saving} className={secondary}>Start over</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Create a quiz or exam</h2>
        <p className="mt-1 text-sm text-gray-600">Pick one of your courses. The AI writes the questions and you check them before anything is saved.</p>
      </div>
      {loadingCourses ? (
        <p className="text-sm text-gray-500">Loading your courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-gray-600">You have no courses yet. <Link href="/teacher/courses" className="font-medium text-blue-600">Create a course first</Link>, then come back.</p>
      ) : (
        <>
          <div>
            <label htmlFor="ai-course" className="mb-1 block text-sm font-medium text-gray-700">Course</label>
            <select id="ai-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className={field}>
              <option value="">Choose a course</option>
              {courses.map((c) => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ai-count" className="mb-1 block text-sm font-medium text-gray-700">How many questions? (1 to 40)</label>
            <input id="ai-count" type="number" inputMode="numeric" min={1} max={40} value={count} onChange={(e) => setCount(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="ai-diff" className="mb-1 block text-sm font-medium text-gray-700">Difficulty</label>
            <select id="ai-diff" value={diff} onChange={(e) => setDiff(e.target.value)} className={field}>
              <option value="mixed">Mixed (30% easy, 50% medium, 20% hard)</option>
              <option value="easy">All easy</option>
              <option value="medium">All medium</option>
              <option value="hard">All hard</option>
            </select>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Question types</p>
            {ALL_TYPES.map((t) => (
              <label key={t} className="flex min-h-[44px] items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={types.includes(t)} onChange={() => toggleType(t)} className="h-5 w-5 accent-blue-600" />{LABEL[t]}
              </label>
            ))}
            <label className="flex min-h-[44px] items-center gap-2 text-sm text-gray-800">
              <input type="checkbox" checked={!flat} onChange={() => setFlat(!flat)} className="h-5 w-5 accent-blue-600" />Harder questions carry more marks (easy 1, medium 2, hard 3)
            </label>
          </div>
          <div>
            <label htmlFor="ai-notes" className="mb-1 block text-sm font-medium text-gray-700">Anything else to consider? (optional)</label>
            <textarea id="ai-notes" value={notes} rows={3} maxLength={500} onChange={(e) => setNotes(e.target.value)}
              placeholder="For example: focus on chapter 3, keep the language simple, use examples from Nigeria" className={field} />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="button" onClick={generate} disabled={generating || !courseId} className={primary}>
            <Sparkles size={16} />{generating ? progress || 'Writing your questions...' : 'Write the questions'}
          </button>
          {generating && <p className="text-xs text-gray-500">Bigger exams take longer, about a minute for every 10 questions. Please keep this page open.</p>}
        </>
      )}
    </div>
  );
}
