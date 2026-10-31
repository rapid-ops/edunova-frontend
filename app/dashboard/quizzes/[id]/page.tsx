'use client';
import { goBack } from '@/lib/nav';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import QuizSettingsForm, { QuizSettings, settingsToPayload, toLocalInput } from '@/components/QuizSettingsForm';
import QuizReview from '@/components/QuizReview';
import QuizExamPanel from '@/components/QuizExamPanel';
import { ChevronLeft, Clock, CheckCircle, Trash2, Plus, Award, XCircle, ArrowUp, ArrowDown, Pencil, Sparkles, Copy } from 'lucide-react';

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
    api.get(`/quizzes/${id}/info`)
      .then(res => setData(res.data))
      .catch(e => setError(e.response?.data?.error || 'Could not load quiz'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!data) return <div className="p-6 text-sm text-red-600">{error || 'Not found'}</div>;

  const quiz = data.quiz;
  const att = data.attempt;
  const left = (quiz.max_attempts || 1) - (att?.attempts_used || 0);
  const closed = quiz.status === 'closed';
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
        <button onClick={() => goBack(router, '/dashboard/quizzes')} className="text-blue-600"><ChevronLeft size={22} /></button>
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
            {result.review && <QuizReview review={result.review} />}
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
          {quiz.negative_marking > 0 && <p className="text-xs text-gray-500">A wrong answer loses {Math.round(quiz.negative_marking * 100)}% of that question's marks.</p>}
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

const blankQ = () => ({ question: '', type: 'mcq', options: ['', '', '', ''], correctIdx: 0, tf: 'True', short: '', marks: '1', explanation: '', pairs: [{ left: '', right: '' }, { left: '', right: '' }] });

const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft: students cannot see it yet', cls: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  scheduled: { label: 'Scheduled: opens later', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  open: { label: 'Open to students', cls: 'bg-green-50 text-green-700 border-green-200' },
  closed: { label: 'Closed', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

function StaffView({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nq, setNq] = useState<any>(blankQ());
  const [savingQ, setSavingQ] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [ai, setAi] = useState({ topic: '', n: '10', difficulty: 'medium' });
  const [aiBusy, setAiBusy] = useState(false);
  const [aiQs, setAiQs] = useState<any[] | null>(null);
  const [aiPick, setAiPick] = useState<Set<number>>(new Set());

  const locked = attempts.length > 0;

  const load = async () => {
    try {
      const m = await api.get(`/quizzes/manage/${id}`);
      setQuiz(m.data.quiz);
      setQuestions(m.data.questions || []);
      const a = await api.get(`/quizzes/attempts/${id}`);
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
      scheduled_at: toLocalInput(quiz.scheduled_at),
      show_answers: !!quiz.show_answers,
      negative_marking: String(quiz.negative_marking ?? 0),
    });
    setEditing(true);
    setError('');
  };

  const saveSettings = async () => {
    if (!settings) return;
    setError(''); setSavingSettings(true);
    try {
      await api.put(`/quizzes/settings/${id}`, settingsToPayload(settings));
      setEditing(false);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not save settings');
    }
    setSavingSettings(false);
  };

  const act = async (path: string) => {
    setError(''); setNote(''); setBusy(true);
    try {
      const r = await api.post(`/assessments/${id}/${path}`);
      await load();
      if (path === 'publish') setNote(r.data.notified ? `Published. ${r.data.notified} students were notified.` : 'Published. Students can see it now.');
      if (path === 'close') setNote('Closed. Students can no longer start it.');
      if (path === 'reopen') setNote('Reopened.');
      if (path === 'unpublish') setNote('Moved back to draft.');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Something went wrong. Please try again.');
    }
    setBusy(false);
  };

  const duplicate = async () => {
    setError(''); setNote(''); setBusy(true);
    try {
      const r = await api.post(`/assessments/${id}/duplicate`);
      const nid = r.data?.assessment?.id ?? r.data?.quiz?.id;
      router.push(nid ? `/dashboard/quizzes/${nid}` : '/dashboard/quizzes');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not duplicate the quiz');
      setBusy(false);
    }
  };

  const startEdit = (q: any) => {
    let qo: any = q.options;
    if (typeof qo === 'string') { try { qo = JSON.parse(qo); } catch { qo = null; } }
    let opts = ['', '', '', ''];
    let idx = 0;
    let pairs = [{ left: '', right: '' }, { left: '', right: '' }];
    if (q.type === 'mcq' && Array.isArray(qo)) { opts = [...qo]; while (opts.length < 4) opts.push(''); idx = Math.max(0, qo.indexOf(q.correct_answer)); }
    if (q.type === 'matching' && Array.isArray(qo)) pairs = qo.map((p: any) => ({ left: String(p.left), right: String(p.right) }));
    setNq({
      question: q.question, type: q.type, options: opts, correctIdx: idx,
      tf: q.correct_answer === 'False' ? 'False' : 'True',
      short: q.type === 'short_answer' || q.type === 'fill_blank' ? q.correct_answer || '' : '',
      marks: String(q.marks), explanation: q.explanation || '', pairs,
    });
    setEditId(q.id); setAdding(true); setAiOpen(false); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => { setAdding(false); setEditId(null); setNq(blankQ()); };

  const saveQuestion = async () => {
    setError(''); setSavingQ(true);
    const payload: any = { question: nq.question, type: nq.type, marks: Number(nq.marks) || 1, explanation: nq.explanation || undefined };
    if (nq.type === 'mcq') {
      payload.options = nq.options.map((o: string) => o.trim()).filter(Boolean);
      payload.correct_answer = (nq.options[nq.correctIdx] || '').trim();
    } else if (nq.type === 'true_false') {
      payload.correct_answer = nq.tf;
    } else if (nq.type === 'matching') {
      const pairs = nq.pairs.map((p: any) => ({ left: p.left.trim(), right: p.right.trim() })).filter((p: any) => p.left && p.right);
      if (pairs.length < 2) { setError('Add at least 2 complete pairs'); setSavingQ(false); return; }
      payload.options = pairs;
    } else {
      payload.correct_answer = nq.short;
    }
    try {
      if (editId) await api.put(`/quizzes/questions/${editId}`, payload);
      else await api.post('/quizzes/questions', { assessment_id: Number(id), ...payload });
      closeForm();
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not save the question');
    }
    setSavingQ(false);
  };

  const removeQuestion = async (qid: number) => {
    setError('');
    try {
      await api.delete(`/quizzes/questions/${qid}`);
      setConfirmDel(null);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not delete question');
    }
  };

  const move = async (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= questions.length) return;
    const order = questions.map(q => q.id);
    [order[i], order[j]] = [order[j], order[i]];
    try {
      const r = await api.put(`/quizzes/${id}/reorder`, { order });
      setQuestions(r.data.questions || []);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not change the order');
    }
  };

  const generate = async () => {
    setError(''); setNote(''); setAiBusy(true); setAiQs(null);
    try {
      const r = await api.post('/ai/generate-quiz', { assessment_id: Number(id), topic: ai.topic, num_questions: Number(ai.n), difficulty: ai.difficulty });
      const qs = r.data.questions || [];
      setAiQs(qs);
      setAiPick(new Set(qs.map((_: any, i: number) => i)));
    } catch (e: any) {
      setError(e.response?.data?.error || 'The assistant could not write questions just now. Please try again.');
    }
    setAiBusy(false);
  };

  const addPicked = async () => {
    const list = (aiQs || []).filter((_, i) => aiPick.has(i)).map(q => ({
      question: q.question, type: 'mcq', options: q.options, correct_answer: q.correct_answer, marks: q.marks || 1, explanation: q.explanation || undefined,
    }));
    if (!list.length) return;
    setError(''); setBusy(true);
    try {
      await api.post(`/quizzes/${id}/questions/bulk`, { questions: list });
      setAiQs(null); setAiOpen(false);
      await load();
      setNote(`${list.length} question${list.length === 1 ? '' : 's'} added.`);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not add the questions');
    }
    setBusy(false);
  };

  if (loading) return <LoadingScreen />;
  if (!quiz) return <div className="p-6 text-sm text-red-600">{error || 'Not found'}</div>;

  const input = 'w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900';
  const st = STATUS[quiz.status] || STATUS.draft;
  const btn = 'text-sm font-medium py-2 px-3 rounded-lg disabled:opacity-40';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <button onClick={() => goBack(router, '/dashboard/quizzes')} className="text-blue-600"><ChevronLeft size={22} /></button>
        <h1 className="text-lg font-bold truncate">{quiz.title}</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}
        {note && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3">{note}</div>}

        <div className={`border rounded-xl p-4 space-y-3 ${st.cls}`}>
          <p className="text-sm font-semibold">{st.label}</p>
          <div className="flex flex-wrap gap-2">
            {quiz.status === 'draft' && (
              <button onClick={() => act('publish')} disabled={busy || questions.length === 0} className={`${btn} bg-blue-600 text-white`}>
                {questions.length === 0 ? 'Add a question to publish' : 'Publish to students'}
              </button>
            )}
            {(quiz.status === 'open' || quiz.status === 'scheduled') && (
              <button onClick={() => act('close')} disabled={busy} className={`${btn} bg-white border border-gray-300 text-gray-800`}>Close now</button>
            )}
            {quiz.status === 'closed' && (
              <button onClick={() => act('reopen')} disabled={busy} className={`${btn} bg-blue-600 text-white`}>Reopen</button>
            )}
            {quiz.is_published && !locked && (
              <button onClick={() => act('unpublish')} disabled={busy} className={`${btn} bg-white border border-gray-300 text-gray-800`}>Back to draft</button>
            )}
            <button onClick={duplicate} disabled={busy} className={`${btn} bg-white border border-gray-300 text-gray-800 flex items-center gap-1`}><Copy size={14} /> Duplicate</button>
          </div>
        </div>

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
                {quiz.randomize_questions ? 'Questions are shuffled. ' : ''}{quiz.awards_certificate ? 'Passing gives the course certificate. ' : ''}
                {quiz.negative_marking > 0 ? `Wrong answers lose ${Math.round(quiz.negative_marking * 100)}% of the marks. ` : ''}
                {quiz.show_answers ? 'Students see the correct answers after submitting. ' : 'Students do not see the correct answers. '}
                Closes {fmt(quiz.due_date)}
              </p>
              <button onClick={openEdit} className="text-sm text-blue-600 font-medium">Edit settings</button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Questions ({questions.length})</p>
          {!adding && !locked && (
            <div className="flex items-center gap-3">
              <button onClick={() => { setAiOpen(!aiOpen); setError(''); }} className="flex items-center gap-1 text-sm text-blue-600 font-medium"><Sparkles size={16} /> Write with AI</button>
              <button onClick={() => { setAdding(true); setEditId(null); setNq(blankQ()); setAiOpen(false); setError(''); }} className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                <Plus size={16} /> Add question
              </button>
            </div>
          )}
        </div>

        {locked && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl p-3">
            Students have started this quiz, so its questions cannot be changed. Use Duplicate to make a new version.
          </div>
        )}

        {!locked && !adding && <QuizExamPanel quizId={id} onAdded={load} />}
        {aiOpen && !adding && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <input value={ai.topic} onChange={e => setAi({ ...ai, topic: e.target.value })} placeholder="Topic, for example Fractions" className={input} />
            <div className="grid grid-cols-2 gap-2">
              <select value={ai.n} onChange={e => setAi({ ...ai, n: e.target.value })} className={input}>
                {['5', '10', '15', '20'].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
              <select value={ai.difficulty} onChange={e => setAi({ ...ai, difficulty: e.target.value })} className={input}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button onClick={generate} disabled={aiBusy || !ai.topic.trim()} className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50">
              {aiBusy ? 'Writing questions...' : 'Write questions'}
            </button>
            {aiQs && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Untick any question you do not want, then add the rest. You can edit them afterwards.</p>
                {aiQs.map((q, i) => (
                  <label key={i} className="flex items-start gap-2 border border-gray-200 rounded-lg p-3 text-sm">
                    <input type="checkbox" checked={aiPick.has(i)} onChange={() => { const s = new Set(aiPick); if (s.has(i)) s.delete(i); else s.add(i); setAiPick(s); }} className="accent-blue-600 mt-1" />
                    <span>
                      <span className="font-medium block">{q.question}</span>
                      {q.options.map((o: string, oi: number) => (
                        <span key={oi} className={`block ${o === q.correct_answer ? 'text-green-600 font-medium' : 'text-gray-500'}`}>{o === q.correct_answer ? '✓ ' : '· '}{o}</span>
                      ))}
                    </span>
                  </label>
                ))}
                <button onClick={addPicked} disabled={busy || aiPick.size === 0} className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50">
                  Add {aiPick.size} to this quiz
                </button>
              </div>
            )}
          </div>
        )}

        {adding && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold">{editId ? 'Edit question' : 'New question'}</p>
            <textarea value={nq.question} onChange={e => setNq({ ...nq, question: e.target.value })} rows={2} placeholder="Question" className={input} />
            <div className="grid grid-cols-2 gap-2">
              <select value={nq.type} onChange={e => setNq({ ...nq, type: e.target.value })} className={input}>
                <option value="mcq">Multiple choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short answer</option>
                <option value="fill_blank">Fill in the blank</option>
                <option value="matching">Matching</option>
              </select>
              <input type="number" min={1} value={nq.marks} onChange={e => setNq({ ...nq, marks: e.target.value })} placeholder="Marks" className={input} />
            </div>
            {nq.type === 'mcq' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Fill the options, then tap the circle beside the correct one</p>
                {nq.options.map((o: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={nq.correctIdx === i} onChange={() => setNq({ ...nq, correctIdx: i })} className="accent-blue-600" />
                    <input value={o} onChange={e => { const opts = [...nq.options]; opts[i] = e.target.value; setNq({ ...nq, options: opts }); }}
                      placeholder={`Option ${i + 1}`} className={input} />
                  </div>
                ))}
                {nq.options.length < 8 && (
                  <button onClick={() => setNq({ ...nq, options: [...nq.options, ''] })} className="flex items-center gap-1 text-sm text-blue-600 font-medium"><Plus size={14} /> Add option</button>
                )}
              </div>
            )}
            {nq.type === 'true_false' && (
              <select value={nq.tf} onChange={e => setNq({ ...nq, tf: e.target.value })} className={input}>
                <option value="True">Correct answer: True</option>
                <option value="False">Correct answer: False</option>
              </select>
            )}
            {(nq.type === 'short_answer' || nq.type === 'fill_blank') && (
              <div>
                <input value={nq.short} onChange={e => setNq({ ...nq, short: e.target.value })} placeholder="Correct answer" className={input} />
                <p className="text-xs text-gray-400 mt-1">Accept several answers by separating them with |</p>
              </div>
            )}
            {nq.type === 'matching' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Enter each item with its correct match. Students see the matches shuffled.</p>
                {nq.pairs.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={p.left} onChange={e => { const ps = [...nq.pairs]; ps[i] = { ...ps[i], left: e.target.value }; setNq({ ...nq, pairs: ps }); }} placeholder={'Item ' + (i + 1)} className={input} />
                    <input value={p.right} onChange={e => { const ps = [...nq.pairs]; ps[i] = { ...ps[i], right: e.target.value }; setNq({ ...nq, pairs: ps }); }} placeholder="Match" className={input} />
                    {nq.pairs.length > 2 && (
                      <button onClick={() => setNq({ ...nq, pairs: nq.pairs.filter((_: any, idx: number) => idx !== i) })} className="text-gray-400 shrink-0"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
                {nq.pairs.length < 8 && (
                  <button onClick={() => setNq({ ...nq, pairs: [...nq.pairs, { left: '', right: '' }] })} className="flex items-center gap-1 text-sm text-blue-600 font-medium"><Plus size={14} /> Add pair</button>
                )}
              </div>
            )}
            <input value={nq.explanation} onChange={e => setNq({ ...nq, explanation: e.target.value })} placeholder="Explanation shown after submitting (optional)" className={input} />
            <div className="flex gap-2">
              <button onClick={saveQuestion} disabled={savingQ} className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50">
                {savingQ ? 'Saving...' : 'Save question'}
              </button>
              <button onClick={closeForm} className="flex-1 bg-white border border-gray-200 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        {questions.length === 0 && !adding && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">No questions yet. Add one, or let the assistant write them.</div>
        )}

        {questions.map((q, i) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm font-medium">{i + 1}. {q.question} <span className="text-xs text-gray-400">({q.marks} mark{q.marks === 1 ? '' : 's'})</span></p>
              {!locked && confirmDel !== q.id && (
                <div className="flex items-center gap-2 shrink-0 text-gray-400">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="disabled:opacity-30"><ArrowUp size={16} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === questions.length - 1} aria-label="Move down" className="disabled:opacity-30"><ArrowDown size={16} /></button>
                  <button onClick={() => startEdit(q)} aria-label="Edit question"><Pencil size={16} /></button>
                  <button onClick={() => setConfirmDel(q.id)} aria-label="Delete question"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
            {q.type === 'mcq' && (q.options || []).map((o: string, oi: number) => (
              <p key={oi} className={`text-sm ${o === q.correct_answer ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {o === q.correct_answer ? '✓ ' : '· '}{o}
              </p>
            ))}
            {q.type === 'matching' && (Array.isArray(q.options) ? q.options : []).map((p: any, pi: number) => (
              <p key={pi} className="text-sm text-green-600 font-medium">{p.left} → {p.right}</p>
            ))}
            {q.type !== 'mcq' && q.type !== 'matching' && <p className="text-sm text-green-600 font-medium">Answer: {q.correct_answer}</p>}
            {q.explanation && <p className="text-xs text-gray-400">Explanation: {q.explanation}</p>}
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
