'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, ClipboardList, Users } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface Assessment { id: number; title: string; type: string; due_date: string | null; question_count?: number; students_attempted?: number; }
interface Submission { id: number; full_name: string; email: string; status: string; score: number | null; text_answer: string | null; file_url: string | null; created_at: string; }
type View = 'list' | 'submissions' | 'grade';

export default function TeacherAssessments() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'quizzes'|'assignments'>('quizzes');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Assessment | null>(null);
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [view, setView] = useState<View>('list');
  const [gradedIds, setGradedIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);

  useEffect(() => {
    if (!user?.school_id) return;
    (async () => {
      try {
        const cr = await api.get(`/courses/school/${user.school_id}`);
        const courses: { id: number }[] = cr.data.courses || [];
        const all: Assessment[] = [];
        await Promise.all(courses.map(async c => {
          try {
            const [qr, ar] = await Promise.all([api.get(`/quizzes/course/${c.id}`), api.get(`/assessments/course/${c.id}`)]);
            all.push(...(qr.data.quizzes || []));
            all.push(...(ar.data.assessments || []).filter((a: Assessment) => a.type !== 'quiz'));
          } catch {}
        }));
        setAssessments(all);
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

  const submitGrade = async () => {
    if (!gradingId) return;
    setSubmitting(true); setError('');
    try {
      await api.put(`/submissions/${gradingId}/grade`, { score: Number(score), feedback });
      setGradedIds(prev => { const n = new Set(prev); n.add(gradingId); return n; });
      setSubmissions(prev => prev.map(s => s.id === gradingId ? { ...s, status: 'graded', score: Number(score) } : s));
      setView('submissions'); setScore(''); setFeedback(''); setGradingId(null);
    } catch (e: any) { setError(e.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const quizzes = assessments.filter(a => a.type === 'quiz');
  const assignments = assessments.filter(a => a.type !== 'quiz');

  if (view === 'grade') {
    const sub = submissions.find(s => s.id === gradingId);
    return (
      <div className="p-6 max-w-xl mx-auto">
        <button onClick={() => setView('submissions')} className="text-blue-600 text-sm mb-5 block">&larr; Back to submissions</button>
        <h2 className="text-xl font-bold text-gray-900 mb-0.5">{sub?.full_name}</h2>
        <p className="text-sm text-gray-400 mb-4">{sub?.email}</p>
        {sub?.text_answer && <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{sub.text_answer}</div>}
        {sub?.file_url && <a href={sub.file_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline mb-4 block">View attached file</a>}
        {!sub?.text_answer && !sub?.file_url && <p className="text-gray-400 text-sm mb-4 italic">No content submitted</p>}
        <input type="number" value={score} onChange={e => setScore(e.target.value)} placeholder="Score (0-100)" min={0} max={100} className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback for student (optional)" rows={3} className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={submitGrade} disabled={submitting || !score} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium text-sm disabled:opacity-50">{submitting?'Saving...':'Save Grade'}</button>
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
          {ungraded > 0 && <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">{ungraded} ungraded</span>}
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {submissions.length === 0 && <p className="text-gray-400 text-sm">No submissions yet.</p>}
        <div className="space-y-3">
          {submissions.map(s => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{s.full_name}</p>
                <p className="text-xs text-gray-400">{s.email} • {new Date(s.created_at).toLocaleDateString()}</p>
                {gradedIds.has(s.id)
                  ? <span className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={11}/>Graded{s.score !== null && ` • ${s.score}/100`}</span>
                  : <span className="text-xs text-yellow-600 mt-1 block">Awaiting grade</span>}
              </div>
              <button onClick={() => { setGradingId(s.id); setScore(s.score?.toString()||''); setFeedback(''); setView('grade'); }} className="shrink-0 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">{gradedIds.has(s.id)?'Edit':'Grade'}</button>
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
        {(['quizzes','assignments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab===t?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>
      {tab === 'quizzes' && (
        <div className="space-y-3">
          {quizzes.length === 0 && <p className="text-gray-400 text-sm">No quizzes found.</p>}
          {quizzes.map(q => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{q.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><ClipboardList size={11}/>{q.question_count ?? 0} questions</span>
                  <span className="flex items-center gap-1"><Users size={11}/>{q.students_attempted ?? 0} attempted</span>
                  {q.due_date && <span>Due {new Date(q.due_date).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'assignments' && (
        <div className="space-y-3">
          {assignments.length === 0 && <p className="text-gray-400 text-sm">No assignments found.</p>}
          {assignments.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{a.type}{a.due_date && ` • Due ${new Date(a.due_date).toLocaleDateString()}`}</p>
              </div>
              <button onClick={() => loadSubmissions(a)} className="shrink-0 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">Submissions</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
