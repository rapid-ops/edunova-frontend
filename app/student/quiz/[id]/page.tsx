'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

interface Question { id: number; question: string; type: string; options: string[] | null; marks: number; }
interface QuizInfo { id: number; title: string; instructions: string | null; total_marks: number; time_limit_minutes: number | null; max_attempts: number; pass_percent: number; awards_certificate: boolean; scheduled_at: string | null; }
type Screen = 'info' | 'questions' | 'result';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [screen, setScreen] = useState<Screen>('info');
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/quizzes/${id}/info`);
        setQuiz(r.data.quiz);
        setAttemptInfo(r.data.attempt);
      } catch (e: any) { setError(e.response?.data?.error || 'Failed to load quiz'); }
    })();
  }, [id]);

  const submitQuiz = useCallback(async (ans: Record<number, string>) => {
    setSubmitting(true);
    try {
      const r = await api.post(`/quizzes/${id}/submit`, { answers: ans });
      setResult(r.data);
      setScreen('result');
    } catch (e: any) {
      const d = e.response?.data;
      if (d?.expired) { setResult({ expired: true }); setScreen('result'); }
      else setError(d?.error || 'Submit failed');
    } finally { setSubmitting(false); }
  }, [id]);

  useEffect(() => {
    if (secondsLeft === null || screen !== 'questions') return;
    if (secondsLeft <= 0) { submitQuiz(answers); return; }
    const t = setTimeout(() => setSecondsLeft(s => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, screen, answers, submitQuiz]);

  const startQuiz = async () => {
    setError('');
    try {
      const r = await api.post(`/quizzes/${id}/start`);
      setQuestions(r.data.questions);
      setSecondsLeft(r.data.seconds_left);
      setScreen('questions');
    } catch (e: any) { setError(e.response?.data?.error || 'Failed to start'); }
  };

  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (error && screen === 'info') return (
    <div className="p-6 max-w-xl mx-auto">
      <p className="text-red-500">{error}</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 text-sm">Go back</button>
    </div>
  );

  if (!quiz) return <div className="p-6 text-gray-500">Loading...</div>;

  if (screen === 'info') return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
      {quiz.instructions && <p className="text-gray-600 text-sm mb-4">{quiz.instructions}</p>}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm text-gray-700">
        {quiz.time_limit_minutes && <p><span className="font-medium">Time limit:</span> {quiz.time_limit_minutes} min</p>}
        <p><span className="font-medium">Max attempts:</span> {quiz.max_attempts}</p>
        <p><span className="font-medium">Pass mark:</span> {quiz.pass_percent}%</p>
        {quiz.awards_certificate && <p className="text-green-600 font-medium">Awards certificate on pass</p>}
        {attemptInfo && <p><span className="font-medium">Attempts used:</span> {attemptInfo.attempts_used} &nbsp;|&nbsp; <span className="font-medium">Best score:</span> {attemptInfo.best_score ?? 'N/A'}</p>}
      </div>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {quiz.scheduled_at && new Date() < new Date(quiz.scheduled_at) ? (
        <p className="text-yellow-600 text-sm">This quiz opens on {new Date(quiz.scheduled_at).toLocaleString()}</p>
      ) : (
        <button onClick={startQuiz} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium">
          {attemptInfo?.status === 'in_progress' ? 'Resume Quiz' : 'Start Quiz'}
        </button>
      )}
    </div>
  );

  if (screen === 'questions') {
    const q = questions[current];
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Question {current+1} of {questions.length}</span>
          {secondsLeft !== null && (
            <span className={`flex items-center gap-1 text-sm font-mono font-medium ${secondsLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
              <Clock size={14}/>{fmt(secondsLeft)}
            </span>
          )}
        </div>
        <div className="bg-white border rounded-xl p-6 mb-4">
          <p className="text-gray-900 font-medium mb-4">{q.question} <span className="text-xs text-gray-400">({q.marks} mark{q.marks>1?'s':''})</span></p>
          {(q.type === 'mcq') && q.options?.map(opt => (
            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border mb-2 cursor-pointer transition-colors ${answers[q.id]===opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name={`q${q.id}`} value={opt} checked={answers[q.id]===opt}
                onChange={() => setAnswers(a => ({...a, [q.id]: opt}))} className="accent-blue-600"/>
              <span className="text-sm">{opt}</span>
            </label>
          ))}
          {q.type === 'true_false' && ['True','False'].map(opt => (
            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border mb-2 cursor-pointer transition-colors ${answers[q.id]===opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name={`q${q.id}`} value={opt} checked={answers[q.id]===opt}
                onChange={() => setAnswers(a => ({...a, [q.id]: opt}))} className="accent-blue-600"/>
              <span className="text-sm">{opt}</span>
            </label>
          ))}
          {(q.type === 'short_answer' || q.type === 'fill_blank') && (
            <input value={answers[q.id] || ''} onChange={e => setAnswers(a => ({...a, [q.id]: e.target.value}))}
              placeholder="Your answer" className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCurrent(c => c-1)} disabled={current===0}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm disabled:opacity-40"><ChevronLeft size={16}/>Prev</button>
          {current < questions.length-1
            ? <button onClick={() => setCurrent(c => c+1)} className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm ml-auto">Next<ChevronRight size={16}/></button>
            : <button onClick={() => submitQuiz(answers)} disabled={submitting}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>}
        </div>
      </div>
    );
  }

  if (screen === 'result') return (
    <div className="p-6 max-w-xl mx-auto text-center">
      {result?.expired ? (
        <><XCircle size={48} className="text-red-500 mx-auto mb-3"/><h2 className="text-xl font-bold text-gray-900">Time Expired</h2><p className="text-gray-500 mt-2">Your attempt was closed with no score.</p></>
      ) : result?.passed ? (
        <><CheckCircle size={48} className="text-green-500 mx-auto mb-3"/><h2 className="text-xl font-bold text-gray-900">Passed!</h2></>
      ) : (
        <><XCircle size={48} className="text-red-500 mx-auto mb-3"/><h2 className="text-xl font-bold text-gray-900">Not passed</h2></>
      )}
      {!result?.expired && result && (
        <div className="bg-gray-50 rounded-xl p-4 mt-4 text-left space-y-2 text-sm">
          <p><span className="text-gray-500">Score:</span> <span className="font-bold text-gray-900">{result.score}/{result.total}</span></p>
          <p><span className="text-gray-500">Percentage:</span> <span className="font-bold">{result.percent}%</span></p>
          {result.certificate_issued && <p className="text-green-600 font-medium">Certificate issued!</p>}
        </div>
      )}
      <button onClick={() => router.push('/student/assessments')} className="mt-6 w-full border rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Back to Assessments</button>
    </div>
  );
}
