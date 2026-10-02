'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function TakeQuizPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState('');
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const answersRef = useRef<Record<number, string>>({});
  const submittedRef = useRef(false);
  const endRef = useRef<number | null>(null);
  const storeKey = useRef('');

  const goBack = () => router.replace(`/dashboard/quizzes/${id}`);

  const submit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/quiz/${id}/submit`, { answers: answersRef.current });
      try {
        sessionStorage.setItem(`quiz_result_${id}`, JSON.stringify(res.data));
        localStorage.removeItem(storeKey.current);
      } catch {}
      goBack();
    } catch (e: any) {
      if (e.response?.data?.expired) {
        try { sessionStorage.setItem(`quiz_result_${id}`, JSON.stringify({ expired: true })); localStorage.removeItem(storeKey.current); } catch {}
        goBack();
        return;
      }
      submittedRef.current = false;
      setSubmitting(false);
      setError(e.response?.data?.error || 'Could not submit. Check your connection and try again.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    api.post(`/quiz/${id}/start`)
      .then(res => {
        const d = res.data;
        setQuiz(d.quiz);
        setQuestions(d.questions || []);
        storeKey.current = `quiz_ans_${id}_${d.attempt_number}`;
        if (d.resumed) {
          try {
            const saved = JSON.parse(localStorage.getItem(storeKey.current) || '{}');
            answersRef.current = saved;
            setAnswers(saved);
          } catch {}
        } else {
          try { localStorage.removeItem(storeKey.current); } catch {}
        }
        if (d.seconds_left !== null && d.seconds_left !== undefined) {
          endRef.current = Date.now() + d.seconds_left * 1000;
          setSecondsLeft(d.seconds_left);
        }
        setLoading(false);
      })
      .catch(e => {
        setFatal(e.response?.data?.error || 'Could not start the quiz');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (loading || fatal || endRef.current === null) return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil(((endRef.current as number) - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) submit();
    }, 1000);
    return () => clearInterval(t);
  }, [loading, fatal]);

  const setAnswer = (qid: number, value: string) => {
    const next = { ...answersRef.current, [qid]: value };
    answersRef.current = next;
    setAnswers(next);
    try { localStorage.setItem(storeKey.current, JSON.stringify(next)); } catch {}
  };

  if (loading) return <LoadingScreen />;

  if (fatal) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 space-y-3">
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">{fatal}</div>
        <button onClick={goBack} className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl">Back to quiz</button>
      </div>
    );
  }

  const q = questions[index];
  const answered = questions.filter(x => (answers[x.id] || '').trim() !== '').length;
  const isLast = index === questions.length - 1;
  const urgent = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-32">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{quiz?.title}</p>
          <p className="text-xs text-gray-400">Question {index + 1} of {questions.length} · {answered} answered</p>
        </div>
        {secondsLeft !== null && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${urgent ? 'text-red-600' : 'text-blue-600'}`}>
            <Clock size={16} /> {mmss(secondsLeft)}
          </div>
        )}
      </div>
      <div className="h-1 bg-gray-200"><div className="h-1 bg-blue-600" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>

      <div className="px-4 py-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {questions.map((x, i) => {
            const done = (answers[x.id] || '').trim() !== '';
            return (
              <button key={x.id} onClick={() => { setIndex(i); setConfirming(false); }}
                className={`shrink-0 w-9 h-9 rounded-lg text-sm font-medium border ${i === index ? 'bg-blue-600 text-white border-blue-600' : done ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                {i + 1}
              </button>
            );
          })}
        </div>

        {q && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-base font-medium">{q.question}</p>
            <p className="text-xs text-gray-400">{q.marks} mark{q.marks === 1 ? '' : 's'}</p>
            {q.type === 'mcq' && (q.options || []).map((opt: string, oi: number) => (
              <button key={oi} onClick={() => setAnswer(q.id, opt)}
                className={`w-full text-left text-sm rounded-xl border p-3 ${answers[q.id] === opt ? 'bg-blue-50 border-blue-600 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-700'}`}>
                {opt}
              </button>
            ))}
            {q.type === 'true_false' && ['True', 'False'].map(opt => (
              <button key={opt} onClick={() => setAnswer(q.id, opt)}
                className={`w-full text-left text-sm rounded-xl border p-3 ${answers[q.id] === opt ? 'bg-blue-50 border-blue-600 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-700'}`}>
                {opt}
              </button>
            ))}
            {q.type === 'short_answer' && (
              <input value={answers[q.id] || ''} onChange={e => setAnswer(q.id, e.target.value)} placeholder="Type your answer"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm" />
            )}
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}

        {confirming && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <p className="text-sm text-red-600">
              You answered {answered} of {questions.length}.{answered < questions.length ? ' Unanswered questions score zero.' : ''} Submit now?
            </p>
            <div className="flex gap-2">
              <button onClick={submit} disabled={submitting} className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit quiz'}
              </button>
              <button onClick={() => setConfirming(false)} className="flex-1 bg-white border border-gray-200 text-sm py-2 rounded-lg">Keep going</button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-200 text-sm py-3 rounded-xl disabled:opacity-40">
            <ChevronLeft size={16} /> Previous
          </button>
          {!isLast ? (
            <button onClick={() => setIndex(i => Math.min(questions.length - 1, i + 1))}
              className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-sm font-medium py-3 rounded-xl">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={() => setConfirming(true)} disabled={submitting}
              className="flex-1 bg-blue-600 text-white text-sm font-medium py-3 rounded-xl disabled:opacity-50">
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
