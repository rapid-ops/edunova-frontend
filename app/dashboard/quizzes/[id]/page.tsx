'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import QuizSettingsForm, { QuizSettings, settingsToPayload, toLocalInput } from '@/components/QuizSettingsForm';
import { ChevronLeft, Clock, CheckCircle, Trash2, Plus, Award, XCircle } from 'lucide-react';

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No closing date';

function StudentView({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`quiz_result_${id}`);
      if (raw) { setResult(JSON.parse(raw)); sessionStorage.removeItem(`quiz_result_${id}`); }
    } catch {}
    api.get(`/quiz/${id}/info`)
      .then(res => setData(res.data))
      .catch(e => setError(e.response?.data?.error || 'Could not load quiz'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!data) return <div className="p-6 text-sm text-red-600">{error || 'Not found'}</div>;

  const quiz = data.quiz;
  const att = data.attempt;
  const left = (quiz.max_attempts || 1) - (att?.attempts_used || 0);
  const closed = quiz.due_date && new Date(quiz.due_date) < new Date();
  const inProgress = att?.status === 'in_progress';

  let label = 'Start quiz';
  let disabled = false;
  if (inProgress) label = 'Resume quiz';
  else if (data.question_count === 0) { label = 'No questions yet'; disabled = true; }
  else if (closed) { label = 'This quiz is closed'; disabled = true; }
  else if (left <= 0) { label = 'No attempts left'; disabled = true; }
  else if (att) label = 'Retake quiz';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <button onClick={() => router.push('/dashboard/quizzes')} className="text-blue-600"><ChevronLeft size={22} /></button>
        <h1 className="text-lg font-bold truncate">{quiz.title}</h1>
      </div>
      <div className="px-4 py-4 space-y-3">
        {result && !result.expired && (
          <div className={`border rounded-xl p-4 ${result.passed ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
            <p className={`text-sm font-semibold flex items-center gap-1 ${result.passed ? 'text-green-700' : 'text-gray-700'}`}>
              {result.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {result.passed ? 'Passed' : 'Not passed'}: {result.score}/{result.total} ({result.percent}%)
            </p>
            {result.certificate_issued && (
              <p className="text-sm text-green-700 mt-1 flex items-center gap-1"><Award size={14} /> Your certificate has been issued</p>
            )}
          </div>
        )}
        {result?.expired && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">Time ran out. That attempt was closed with no score.</div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
          {quiz.course_title && <p className="text-xs text-gray-400">{quiz.course_title}</p>}
          {quiz.instructions && <p className="text-sm whitespace-pre-wrap">{quiz.instructions}</p>}
          <p className="text-sm text-gray-600">{data.question_count} question{data.question_count === 1 ? '' : 's'} · {quiz.total_marks} marks</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Clock size={14} className="text-blue-600" />
            {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} minutes. The timer starts when you press Start.` : 'No time limit'}
          </p>
          <p className="text-sm text-gray-600">Pass mark {quiz.pass_percent}% · {att?.attempts_used || 0} of {quiz.max_attempts} attempts used</p>
          {quiz.due_date && <p className="text-xs text-gray-400">Closes {fmt(quiz.due_date)}</p>}
        </div>

        {att && att.attempts_used > 0 && att.status === 'submitted' && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold">Best score: {att.best_score ?? 0}/{quiz.total_marks}</p>
            {att.passed && <p className="text-xs text-green-600 mt-1">You have passed this quiz</p>}
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}

        <button disabled={disabled} onClick={() => router.push(`/dashboard/quizzes/${id}/take`)}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl disabled:opacity-40">
          {label}
        </button>
      </div>
    </div>
  );
}

function StaffView({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [adding, setAdding] = useState(false);
  const [nq, setNq] = useState({ question: '', type: 'mcq', options: ['', '', '', ''], correctIdx: 0, tf: 'True', short: '', marks: '1' });
  const [savingQ, setSavingQ] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  const load = async () => {
    try {
      const m = await api.get(`/quiz/manage/${id}`);
      setQuiz(m.data.quiz);
      setQuestions(m.data.questions || []);
      const a = await api.get(`/quiz/attempts/${id}`);
      setAttempts(a.data.attempts || []);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not load quiz');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const openEdit = () => {
    setSettings({
      title: quiz.title,
      instructions: quiz.instructions || '',
      due_date: toLocalInput(quiz.due_date),
      time_limit_minutes: quiz.time_limit_minutes == null ? '' : String(quiz.time_limit_minutes),
      max_attempts: String(quiz.max_attempts),
      pass_percent: String(quiz.pass_percent),
      randomize_questions: !!quiz.randomize_questions,
      awards_certificate: !!quiz.awards_certificate,
    });
    setEditing(true);
    setError('');
  };

  const saveSettings = async () => {
    if (!settings) return;
    setError(''); setSavingSettings(true);
    try {
      await api.put(`/quiz/settings/${id}`, settingsToPayload(settings));
      setEditing(false);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not save settings');
    }
    setSavingSettings(false);
  };

  const addQuestion = async () => {
    setError(''); setSavingQ(true);
    const payload: any = { assessment_id: Number(id), question: nq.question, type: nq.type, marks: Number(nq.marks) || 1 };
    if (nq.type === 'mcq') {
      payload.options = nq.options.map(o => o.trim()).filter(Boolean);
      payload.correct_answer = (nq.options[nq.correctIdx] || '').trim();
    } else if (nq.type === 'true_false') {
      payload.correct_answer = nq.tf;
    } else {
      payload.correct_answer = nq.short;
    }
    try {
      await api.post('/quiz/questions', payload);
      setNq({ question: '', type: 'mcq', options: ['', '', '', ''], correctIdx: 0, tf: 'True', short: '', marks: '1' });
      setAdding(false);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not add question');
    }
    setSavingQ(false);
  };

  const removeQuestion = async (qid: number) => {
    setError('');
    try {
      await api.delete(`/quiz/questions/${qid}`);
      setConfirmDel(null);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not delete question');
    }
  };

  if (loading) return <LoadingScreen />;
  if (!quiz) return <div className="p-6 text-sm text-red-600">{error || 'Not found'}</div>;

  const input = 'w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <button onClick={() => router.push('/dashboard/quizzes')} className="text-blue-600"><ChevronLeft size={22} /></button>
        <h1 className="text-lg font-bold truncate">{quiz.title}</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
          {editing && settings ? (
            <>
              <QuizSettingsForm value={settings} onChange={setSettings} />
              <div className="flex gap-2">
                <button onClick={saveSettings} disabled={savingSettings} className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50">
                  {savingSettings ? 'Saving...' : 'Save settings'}
                </button>
                <button onClick={() => setEditing(false)} className="flex-1 bg-white border border-gray-200 text-sm py-2 rounded-lg">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : 'No time limit'} · {quiz.max_attempts} attempt{quiz.max_attempts === 1 ? '' : 's'} · pass {quiz.pass_percent}% · {quiz.total_marks} marks
              </p>
              <p className="text-xs text-gray-400">
                {quiz.randomize_questions ? 'Questions are shuffled. ' : ''}{quiz.awards_certificate ? 'Passing gives the course certificate. ' : ''}Closes {fmt(quiz.due_date)}
              </p>
              <button onClick={openEdit} className="text-sm text-blue-600 font-medium">Edit settings</button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Questions ({questions.length})</p>
          {!adding && (
            <button onClick={() => { setAdding(true); setError(''); }} className="flex items-center gap-1 text-sm text-blue-600 font-medium">
              <Plus size={16} /> Add question
            </button>
          )}
        </div>

        {adding && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <textarea value={nq.question} onChange={e => setNq({ ...nq, question: e.target.value })} rows={2} placeholder="Question" className={input} />
            <div className="grid grid-cols-2 gap-2">
              <select value={nq.type} onChange={e => setNq({ ...nq, type: e.target.value })} className={input}>
                <option value="mcq">Multiple choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short answer</option>
              </select>
              <input type="number" min={1} value={nq.marks} onChange={e => setNq({ ...nq, marks: e.target.value })} placeholder="Marks" className={input} />
            </div>
            {nq.type === 'mcq' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Fill the options, then tap the circle beside the correct one</p>
                {nq.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={nq.correctIdx === i} onChange={() => setNq({ ...nq, correctIdx: i })} className="accent-blue-600" />
                    <input value={o} onChange={e => { const opts = [...nq.options]; opts[i] = e.target.value; setNq({ ...nq, options: opts }); }}
                      placeholder={`Option ${i + 1}`} className={input} />
                  </div>
                ))}
              </div>
            )}
            {nq.type === 'true_false' && (
              <select value={nq.tf} onChange={e => setNq({ ...nq, tf: e.target.value })} className={input}>
                <option value="True">Correct answer: True</option>
                <option value="False">Correct answer: False</option>
              </select>
            )}
            {nq.type === 'short_answer' && (
              <div>
                <input value={nq.short} onChange={e => setNq({ ...nq, short: e.target.value })} placeholder="Correct answer" className={input} />
                <p className="text-xs text-gray-400 mt-1">Accept several answers by separating them with |</p>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={addQuestion} disabled={savingQ} className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50">
                {savingQ ? 'Saving...' : 'Save question'}
              </button>
              <button onClick={() => setAdding(false)} className="flex-1 bg-white border border-gray-200 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        {questions.length === 0 && !adding && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">No questions yet</div>
        )}

        {questions.map((q, i) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm font-medium">{i + 1}. {q.question} <span className="text-xs text-gray-400">({q.marks} mark{q.marks === 1 ? '' : 's'})</span></p>
              {confirmDel !== q.id && (
                <button onClick={() => setConfirmDel(q.id)} className="text-gray-400 shrink-0"><Trash2 size={16} /></button>
              )}
            </div>
            {q.type === 'mcq' && (q.options || []).map((o: string, oi: number) => (
              <p key={oi} className={`text-sm ${o === q.correct_answer ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {o === q.correct_answer ? '✓ ' : '· '}{o}
              </p>
            ))}
            {q.type !== 'mcq' && <p className="text-sm text-green-600 font-medium">Answer: {q.correct_answer}</p>}
            {confirmDel === q.id && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <p className="text-sm text-red-600">Delete this question?</p>
                <div className="flex gap-2">
                  <button onClick={() => removeQuestion(q.id)} className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg">Delete</button>
                  <button onClick={() => setConfirmDel(null)} className="flex-1 bg-white border border-gray-200 text-sm py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}

        <p className="text-sm font-semibold pt-2">Student results ({attempts.length})</p>
        {attempts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">Nobody has taken this quiz yet</div>
        )}
        {attempts.map(a => (
          <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{a.full_name || a.email}</p>
              <p className="text-xs text-gray-400">{a.attempt_count} attempt{a.attempt_count === 1 ? '' : 's'}{a.status === 'in_progress' ? ' · taking it now' : ''}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold">{a.score ?? 0}/{quiz.total_marks}</p>
              <p className={`text-xs ${a.passed ? 'text-green-600' : 'text-gray-400'}`}>{a.passed ? 'Passed' : 'Not passed'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    let r = 'student';
    try { r = JSON.parse(localStorage.getItem('user') || '{}').role || 'student'; } catch {}
    setRole(r);
  }, []);

  if (!role) return <LoadingScreen />;
  if (role === 'student') return <StudentView id={id} />;
  if (['teacher', 'school_admin', 'super_admin'].includes(role)) return <StaffView id={id} />;
  return <div className="p-6 text-sm text-gray-500">Quizzes are for students and teachers</div>;
}
