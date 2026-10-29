'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Trash2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface CourseOption { id: number; title: string; description?: string | null; teacher_id?: number | null; }
interface Draft { type: 'mcq' | 'short_answer'; question: string; options: string[]; answer: number; text: string; }

const field = 'w-full min-h-[44px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500';
const primary = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50';
const secondary = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';

const letterIndex = (s: string, n: number) => {
  const t = s.trim().toLowerCase();
  const i = 'abcdefgh'.indexOf(t);
  return t.length === 1 && i >= 0 && i < n ? i : -1;
};

const toDraft = (q: any): Draft | null => {
  const question = String((q && q.question) || '').trim();
  if (!question) return null;
  const options: string[] = Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : [];
  const correct = String(q.correct_answer === undefined || q.correct_answer === null ? '' : q.correct_answer).trim();
  if (options.length >= 2) {
    let idx = options.findIndex((o) => o.trim().toLowerCase() === correct.toLowerCase());
    if (idx < 0) idx = letterIndex(correct, options.length);
    return { type: 'mcq', question, options, answer: idx, text: '' };
  }
  return { type: 'short_answer', question, options: [], answer: -1, text: correct };
};

export default function AiQuizGenerator() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseId, setCourseId] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'saved'>('form');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState(0);

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

  const patch = (i: number, p: Partial<Draft>) => setDrafts((prev) => prev.map((d, k) => (k === i ? { ...d, ...p } : d)));
  const setOpt = (i: number, j: number, v: string) =>
    setDrafts((prev) => prev.map((d, k) => (k === i ? { ...d, options: d.options.map((o, m) => (m === j ? v : o)) } : d)));

  const generate = async () => {
    const course = courses.find((c) => String(c.id) === courseId);
    if (!course) { setError('Choose a course first.'); return; }
    setGenerating(true);
    setError('');
    try {
      let topic = course.title;
      if (course.description) topic += '. ' + course.description.slice(0, 300);
      if (notes.trim()) topic += '. Also consider: ' + notes.trim().slice(0, 500);
      const r = await api.post('/ai/generate-quiz', { course_id: Number(courseId), topic, num_questions: 5, difficulty: 'medium' });
      const list = (r.data.questions || []).map(toDraft).filter(Boolean) as Draft[];
      if (!list.length) {
        setError('We could not make questions this time. Add a little more detail in the box and try again.');
      } else {
        setDrafts(list);
        setTitle(course.title + ' quiz');
        setQuizId(null);
        setStep('review');
      }
    } catch (e: any) {
      setError(e.response?.data?.error || 'We could not make the quiz right now. Please try again in a moment.');
    }
    setGenerating(false);
  };

  const save = async () => {
    setError('');
    const clean: any[] = [];
    for (let i = 0; i < drafts.length; i++) {
      const d = drafts[i];
      if (!d.question.trim()) { setError('Question ' + (i + 1) + ' is empty. Write it or remove it.'); return; }
      if (d.type === 'mcq') {
        const opts = d.options.map((o) => o.trim());
        if (opts.some((o) => !o)) { setError('Question ' + (i + 1) + ' has an empty answer choice. Fill it in or remove the question.'); return; }
        if (d.answer < 0) { setError('Choose the correct answer for question ' + (i + 1) + '.'); return; }
        clean.push({ question: d.question.trim(), type: 'mcq', options: opts, correct_answer: opts[d.answer], marks: 1 });
      } else {
        if (!d.text.trim()) { setError('Question ' + (i + 1) + ' needs a correct answer.'); return; }
        clean.push({ question: d.question.trim(), type: 'short_answer', correct_answer: d.text.trim(), marks: 1 });
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
        await api.post('/quizzes/' + id + '/questions/bulk', { questions: clean });
      } catch (e: any) {
        if (e.response?.status !== 404) throw e;
        for (const q of clean) await api.post('/quizzes/questions', { assessment_id: id, ...q });
      }
      setSavedCount(clean.length);
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
            <p className="mt-1 text-sm text-gray-600">{savedCount} {savedCount === 1 ? 'question' : 'questions'} added to "{title}". Students cannot see it until you publish it.</p>
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
    return (
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Check your questions</h2>
          <p className="mt-1 text-sm text-gray-600">Change anything you like. Nothing is saved until you press Save as draft quiz.</p>
        </div>
        <div>
          <label htmlFor="quiz-title" className="mb-1 block text-sm font-medium text-gray-700">Quiz title</label>
          <input id="quiz-title" value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)} className={field} />
        </div>
        <div className="space-y-3">
          {drafts.map((d, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500">Question {i + 1}</span>
                <button type="button" onClick={() => setDrafts(drafts.filter((_, k) => k !== i))} className="inline-flex min-h-[44px] items-center gap-1 px-2 text-xs font-medium text-red-600">
                  <Trash2 size={14} />Remove
                </button>
              </div>
              <textarea value={d.question} rows={2} onChange={(e) => patch(i, { question: e.target.value })} className={field} />
              {d.type === 'mcq' ? (
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
              ) : (
                <div className="mt-2">
                  <label className="mb-1 block text-xs text-gray-500">Correct answer</label>
                  <input value={d.text} onChange={(e) => patch(i, { text: e.target.value })} className={field} />
                </div>
              )}
            </div>
          ))}
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={save} disabled={saving} className={primary}>{saving ? 'Saving...' : 'Save as draft quiz'}</button>
          <button type="button" onClick={generate} disabled={saving || generating} className={secondary}>{generating ? 'Making new questions...' : 'Make new questions'}</button>
          <button type="button" onClick={reset} disabled={saving} className={secondary}>Start over</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Generate a quiz</h2>
        <p className="mt-1 text-sm text-gray-600">Pick one of your courses. The AI writes questions for it and you check them before anything is saved.</p>
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
            <label htmlFor="ai-notes" className="mb-1 block text-sm font-medium text-gray-700">Anything else to consider? (optional)</label>
            <textarea id="ai-notes" value={notes} rows={3} maxLength={500} onChange={(e) => setNotes(e.target.value)}
              placeholder="For example: focus on chapter 3, keep the language simple, use examples from Nigeria" className={field} />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="button" onClick={generate} disabled={generating || !courseId} className={primary}>
            <Sparkles size={16} />{generating ? 'Writing your questions...' : 'Generate quiz'}
          </button>
          {generating && <p className="text-xs text-gray-500">This can take up to a minute. Please keep this page open.</p>}
        </>
      )}
    </div>
  );
}
