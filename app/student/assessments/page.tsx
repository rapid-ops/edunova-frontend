'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, PlayCircle, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '@/lib/api';

interface Quiz { id: number; title: string; course_title: string; attempt_status: string | null; attempts_used: number; max_attempts: number; best_score: number | null; total_marks: number; due_date: string | null; scheduled_at: string | null; }
interface Assignment { id: number; title: string; course_title: string; type: string; due_date: string | null; total_marks: number; submission?: { status: string; score: number | null; } | null; }

export default function StudentAssessments() {
  const router = useRouter();
  const [tab, setTab] = useState<'quizzes' | 'assignments'>('quizzes');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [subModal, setSubModal] = useState<Assignment | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [qr, ar] = await Promise.all([
          api.get('/quizzes/me'),
          api.get('/assessments/my'),
        ]);
        setQuizzes(qr.data.quizzes || []);
        const ass: Assignment[] = (ar.data.assessments || []).filter((a: Assignment) => a.type !== 'quiz');
        const withSubs = await Promise.all(ass.map(async (a) => {
          try {
            const sr = await api.get(`/submissions/my/${a.id}`);
            return { ...a, submission: sr.data.submission };
          } catch { return { ...a, submission: null }; }
        }));
        setAssignments(withSubs);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!subModal) return;
    setSubmitting(true); setError('');
    try {
      await api.post('/submissions', { assessment_id: subModal.id, text_answer: textAnswer || undefined, file_url: fileUrl || undefined });
      setSubModal(null); setTextAnswer(''); setFileUrl('');
      setAssignments(prev => prev.map(a => a.id === subModal.id ? { ...a, submission: { status: 'submitted', score: null } } : a));
    } catch (e: any) { setError(e.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const statusBadge = (s: string | null) => {
    if (s === 'submitted') return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Submitted</span>;
    if (s === 'graded') return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Graded</span>;
    return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Not submitted</span>;
  };

  const quizBadge = (q: Quiz) => {
    const s = q.attempt_status;
    if (s === 'submitted' && q.best_score !== null) {
      const pct = (q.best_score / q.total_marks) * 100;
      return pct >= 50
        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle size={12}/>Passed</span>
        : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle size={12}/>Failed</span>;
    }
    if (s === 'in_progress') return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock size={12}/>In progress</span>;
    return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Not started</span>;
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Assessments</h1>
      <div className="flex gap-2 mb-6 border-b">
        {(['quizzes','assignments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab===t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'quizzes' && (
        <div className="space-y-3">
          {quizzes.length === 0 && <p className="text-gray-500 text-sm">No quizzes found.</p>}
          {quizzes.map(q => (
            <div key={q.id} className="bg-white border rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{q.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{q.course_title} {q.due_date && `• Due ${new Date(q.due_date).toLocaleDateString()}`}</p>
                <div className="flex items-center gap-2 mt-1">{quizBadge(q)}
                  {q.best_score !== null && <span className="text-xs text-gray-500">{q.best_score}/{q.total_marks}</span>}
                  <span className="text-xs text-gray-400">{q.attempts_used}/{q.max_attempts} attempts</span>
                </div>
              </div>
              <button onClick={() => router.push(`/student/quiz/${q.id}`)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg">
                <PlayCircle size={16}/> {q.attempt_status === 'in_progress' ? 'Resume' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'assignments' && (
        <div className="space-y-3">
          {assignments.length === 0 && <p className="text-gray-500 text-sm">No assignments found.</p>}
          {assignments.map(a => (
            <div key={a.id} className="bg-white border rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{a.course_title} {a.due_date && `• Due ${new Date(a.due_date).toLocaleDateString()}`}</p>
                <div className="flex items-center gap-2 mt-1">
                  {statusBadge(a.submission?.status || null)}
                  {a.submission?.score !== null && a.submission?.score !== undefined &&
                    <span className="text-xs text-gray-500">Score: {a.submission.score}/{a.total_marks}</span>}
                </div>
              </div>
              {!a.submission && (
                <button onClick={() => { setSubModal(a); setError(''); }}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg">
                  <Upload size={16}/> Submit
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {subModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-1">{subModal.title}</h2>
            <p className="text-sm text-gray-500 mb-4">Submit your answer below</p>
            <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
              placeholder="Write your answer here..." rows={5}
              className="w-full border rounded-lg p-3 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input value={fileUrl} onChange={e => setFileUrl(e.target.value)}
              placeholder="Or paste a file URL (Google Drive, etc.)"
              className="w-full border rounded-lg p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setSubModal(null)} className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
