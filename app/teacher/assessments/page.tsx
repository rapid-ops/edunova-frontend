'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle, ClipboardList, Users, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface RubricCriterion { criterion: string; max_score: number; }
interface Assessment { id: number; title: string; type: string; due_date: string | null; total_marks?: number; question_count?: number; students_attempted?: number; rubric?: RubricCriterion[] | null; }
interface Submission { id: number; full_name: string; email: string; status: string; score: number | string | null; feedback: string | null; text_answer: string | null; file_url: string | null; submitted_at: string; }
interface Course { id: number; title: string; }
interface RubricRow { criterion: string; max_score: string; }
type View = 'list' | 'submissions' | 'grade' | 'create';

export default function TeacherAssessments() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'quizzes' | 'assignments'>('quizzes');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Assessment | null>(null);
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rubricScores, setRubricScores] = useState<Record<string, string>>({});
  const [view, setView] = useState<View>('list');
  const [gradedIds, setGradedIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cCourse, setCCourse] = useState('');
  const [cTitle, setCTitle] = useState('');
  const [cType, setCType] = useState<'assignment' | 'exam'>('assignment');
  const [cDue, setCDue] = useState('');
  const [cMarks, setCMarks] = useState('100');
  const [cRubric, setCRubric] = useState<RubricRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [counts, setCounts] = useState<Record<number, { submission_count: number; graded_count: number }>>({});

  const rub = selected?.rubric && selected.rubric.length > 0 ? selected.rubric : null;
  const maxScore = Number(selected?.total_marks) || 100;

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);

  useEffect(() => {
    if (!user?.school_id) return;
    (async () => {
      try {
        const cr = await api.get(`/courses/school/${user.school_id}`);
        const list: Course[] = cr.data.courses || [];
        setCourses(list);
        const all: Assessment[] = [];
        await Promise.all(list.map(async c => {
          try {
            const [qr, ar] = await Promise.all([
              api.get(`/quizzes/course/${c.id}`),
              api.get(`/assessments/course/${c.id}`),
            ]);
            all.push(...(qr.data.quizzes || []));
            all.push(...(ar.data.assessments || []).filter((a: Assessment) => a.type !== 'quiz'));
          } catch {}
        }));
        setAssessments(all);
        try {
          const sr = await api.get('/assessments/school-stats');
          const m: Record<number, { submission_count: number; graded_count: number }> = {};
          (sr.data.assessments || []).forEach((x: any) => { m[x.id] = { submission_count: Number(x.submission_count) || 0, graded_count: Number(x.graded_count) || 0 }; });
          setCounts(m);
        } catch {}
      } catch {}
    })();
  }, [user]);

  const loadSubmissions = async (a: Assessment) => {
    setSelected(a); setView('submissions'); setError('');
    try {
      const r = await api.get(`/submissions/assessment/${a.id}`);
      const subs: Submission[] = r.data.submissions || [];
      setSubmissions(subs);
      setGradedIds(new Set(subs.filter(s => s.status === 'graded').map(s => s.id)));
    } catch (e: any) { setError(e.response?.data?.error || 'Failed to load'); }
  };

  const openGrade = (s: Submission) => {
    setGradingId(s.id);
    setError('');
    let fb = s.feedback || '';
    let saved: Record<string, unknown> = {};
    if (rub && s.feedback) {
      try {
        const p = JSON.parse(s.feedback);
        if (p && typeof p === 'object') {
          fb = typeof p.text === 'string' ? p.text : '';
          saved = p.rubric_scores || {};
        }
      } catch {}
    }
    if (rub) {
      const init: Record<string, string> = {};
      rub.forEach(r => { init[r.criterion] = String(saved[r.criterion] ?? '0'); });
      setRubricScores(init);
      setScore('');
    } else {
      setRubricScores({});
      setScore(s.score !== null && s.score !== undefined ? String(Number(s.score)) : '');
    }
    setFeedback(fb);
    setView('grade');
  };

  const clampScore = (r: RubricCriterion) =>
    Math.max(0, Math.min(Number(rubricScores[r.criterion]) || 0, r.max_score));
  const rubricTotal = rub ? rub.reduce((sum, r) => sum + clampScore(r), 0) : 0;
  const rubricMaxTotal = rub ? rub.reduce((sum, r) => sum + r.max_score, 0) : 0;

  const submitGrade = async () => {
    if (gradingId === null) return;
    setSubmitting(true); setError('');
    try {
      let finalScore = Number(score);
      let finalFeedback = feedback;
      if (rub) {
        const clean: Record<string, number> = {};
        rub.forEach(r => { clean[r.criterion] = clampScore(r); });
        finalScore = rub.reduce((sum, r) => sum + clean[r.criterion], 0);
        finalFeedback = JSON.stringify({ rubric_scores: clean, text: feedback });
      }
      await api.put(`/submissions/${gradingId}/grade`, { score: finalScore, feedback: finalFeedback });
      setGradedIds(prev => { const n = new Set(prev); n.add(gradingId); return n; });
      setSubmissions(prev => prev.map(s =>
        s.id === gradingId ? { ...s, status: 'graded', score: finalScore, feedback: finalFeedback } : s
      ));
      setView('submissions'); setScore(''); setFeedback('');
      setRubricScores({}); setGradingId(null);
    } catch (e: any) { setError(e.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const resetCreate = () => {
    setCCourse(''); setCTitle(''); setCType('assignment'); setCDue('');
    setCMarks('100'); setCRubric([]); setError('');
  };

  const setRow = (i: number, patch: Partial<RubricRow>) =>
    setCRubric(prev => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const createAssignment = async () => {
    setError('');
    if (!cCourse) { setError('Select a course'); return; }
    if (!cTitle.trim()) { setError('Title is required'); return; }
    const rows = cRubric.filter(r => r.criterion.trim());
    const rubric = rows.map(r => ({ criterion: r.criterion.trim(), max_score: Number(r.max_score) }));
    if (rubric.some(r => !(r.max_score > 0))) { setError('Each criterion needs a max score above 0'); return; }
    if (new Set(rubric.map(r => r.criterion.toLowerCase())).size !== rubric.length) { setError('Criteria must have different names'); return; }
    const total = rubric.length > 0 ? rubric.reduce((s, r) => s + r.max_score, 0) : (Number(cMarks) || 100);
    setCreating(true);
    try {
      const res = await api.post('/assessments', {
        course_id: Number(cCourse),
        title: cTitle.trim(),
        type: cType,
        due_date: cDue ? new Date(cDue).toISOString() : undefined,
        total_marks: total,
        rubric: rubric.length > 0 ? rubric : undefined,
      });
      setAssessments(prev => [res.data.assessment, ...prev]);
      resetCreate(); setTab('assignments'); setView('list');
    } catch (e: any) { setError(e.response?.data?.error || 'Failed to create'); }
    finally { setCreating(false); }
  };

  const quizzes = assessments.filter(a => a.type === 'quiz');
  const assignments = assessments.filter(a => a.type !== 'quiz');

  if (view === 'create') {
    const rubricSum = cRubric
      .filter(r => r.criterion.trim())
      .reduce((s, r) => s + (Number(r.max_score) || 0), 0);
    const hasRows = cRubric.some(r => r.criterion.trim());
    return (
      <div className="p-6 max-w-xl mx-auto">
        <button onClick={() => { resetCreate(); setView('list'); }} className="text-blue-600 text-sm mb-5 block">&larr; Back</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">New assignment</h2>
        <select value={cCourse} onChange={e => setCCourse(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select course</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input value={cTitle} onChange={e => setCTitle(e.target.value)} placeholder="Title" className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <select value={cType} onChange={e => setCType(e.target.value as 'assignment' | 'exam')} className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="assignment">Assignment</option>
          <option value="exam">Exam</option>
        </select>
        <label className="text-xs text-gray-400 block mb-1">Due date (optional)</label>
        <input type="datetime-local" value={cDue} onChange={e => setCDue(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        {!hasRows && (
          <input type="number" value={cMarks} onChange={e => setCMarks(e.target.value)} placeholder="Total marks" min={1} max={1000} className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        )}

        <div className="mt-2 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Rubric (optional)</p>
            <button onClick={() => setCRubric(prev => [...prev, { criterion: '', max_score: '' }])} className="flex items-center gap-1 text-sm text-blue-600"><Plus size={14}/>Add criterion</button>
          </div>
          <div className="space-y-2">
            {cRubric.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={r.criterion} onChange={e => setRow(i, { criterion: e.target.value })} placeholder="Criterion" className="flex-1 min-w-0 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <input type="number" value={r.max_score} onChange={e => setRow(i, { max_score: e.target.value })} placeholder="Max" min={1} className="w-20 border border-gray-200 rounded-xl p-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <button onClick={() => setCRubric(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
          {hasRows && <p className="text-xs text-gray-500 mt-2">Total marks will be {rubricSum}</p>}
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={createAssignment} disabled={creating} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium text-sm disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>
      </div>
    );
  }

  if (view === 'grade') {
    const sub = submissions.find(s => s.id === gradingId);
    return (
      <div className="p-6 max-w-xl mx-auto">
        <button onClick={() => setView('submissions')} className="text-blue-600 text-sm mb-5 block">&larr; Back to submissions</button>
        <h2 className="text-xl font-bold text-gray-900 mb-0.5">{sub?.full_name}</h2>
        <p className="text-sm text-gray-400 mb-4">{sub?.email}</p>

        {sub?.text_answer && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{sub.text_answer}</div>
        )}
        {sub?.file_url && (
          <a href={sub.file_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline mb-4 block">View attached file</a>
        )}
        {!sub?.text_answer && !sub?.file_url && (
          <p className="text-gray-400 text-sm mb-4 italic">No content submitted</p>
        )}

        {rub ? (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Rubric</p>
            <div className="space-y-3">
              {rub.map(r => (
                <div key={r.criterion} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{r.criterion}</p>
                    <p className="text-xs text-gray-400">Max: {r.max_score}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={r.max_score}
                    value={rubricScores[r.criterion] ?? '0'}
                    onChange={e => setRubricScores(prev => ({ ...prev, [r.criterion]: e.target.value }))}
                    className="w-20 border border-gray-200 rounded-lg p-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 px-1">
              <span className="text-sm text-gray-500">Total score</span>
              <span className="text-lg font-bold text-blue-600">{rubricTotal} / {rubricMaxTotal}</span>
            </div>
          </div>
        ) : (
          <input
            type="number"
            value={score}
            onChange={e => setScore(e.target.value)}
            placeholder={`Score (0-${maxScore})`}
            min={0}
            max={maxScore}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Feedback for student (optional)"
          rows={3}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          onClick={submitGrade}
          disabled={submitting || (!rub && score === '')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium text-sm disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Grade'}
        </button>
      </div>
    );
  }

  if (view === 'submissions' && selected) {
    const ungraded = submissions.filter(s => !gradedIds.has(s.id)).length;
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => setView('list')} className="text-blue-600 text-sm mb-5 block">&larr; Back</button>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold text-gray-900 flex-1">{selected.title}</h2>
          {ungraded > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">{ungraded} ungraded</span>
          )}
        </div>
        {rub && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700">
            Rubric: {rub.map(r => `${r.criterion} (${r.max_score})`).join(' • ')}
          </div>
        )}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {submissions.length === 0 && <p className="text-gray-400 text-sm">No submissions yet.</p>}
        <div className="space-y-3">
          {submissions.map(s => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{s.full_name}</p>
                <p className="text-xs text-gray-400">{s.email} • {new Date(s.submitted_at).toLocaleDateString()}</p>
                {gradedIds.has(s.id)
                  ? <span className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={11}/>Graded{s.score !== null && ` • ${Number(s.score)}/${maxScore}`}</span>
                  : <span className="text-xs text-yellow-600 mt-1 block">Awaiting grade</span>}
              </div>
              <button onClick={() => openGrade(s)} className="shrink-0 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">
                {gradedIds.has(s.id) ? 'Edit' : 'Grade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Assessments</h1>
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(['quizzes', 'assignments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'quizzes' && (
        <div className="space-y-3">
          <Link href="/dashboard/quizzes/new" className="mb-1 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg"><Plus size={15}/>New quiz</Link>
          {quizzes.length === 0 && <p className="text-gray-400 text-sm">No quizzes found.</p>}
          {quizzes.map(q => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <Link href={`/dashboard/quizzes/${q.id}`} className="font-medium text-blue-600">{q.title}</Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><ClipboardList size={11}/>{q.question_count ?? 0} questions</span>
                  <span className="flex items-center gap-1"><Users size={11}/>{q.students_attempted ?? 0} attempted</span>
                  {q.due_date && <span>Due {new Date(q.due_date).toLocaleDateString()}</span>}
                  <Link href={`/dashboard/quizzes/${q.id}`} className="text-blue-600 font-medium">View / edit</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'assignments' && (
        <div className="space-y-3">
          <button onClick={() => { resetCreate(); setView('create'); }} className="mb-1 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg">
            <Plus size={15}/>New assignment
          </button>
          {assignments.length === 0 && <p className="text-gray-400 text-sm">No assignments found.</p>}
          {assignments.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{a.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400 capitalize">{a.type}{a.due_date && ` • Due ${new Date(a.due_date).toLocaleDateString()}`}</p>
                  {a.rubric && a.rubric.length > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Rubric</span>
                  )}
                  {counts[a.id] && (
                    <span className="text-xs text-gray-400">{counts[a.id].submission_count} submitted</span>
                  )}
                  {counts[a.id] && counts[a.id].submission_count - counts[a.id].graded_count > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">{counts[a.id].submission_count - counts[a.id].graded_count} ungraded</span>
                  )}
                </div>
              </div>
              <button onClick={() => loadSubmissions(a)} className="shrink-0 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">Submissions</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
