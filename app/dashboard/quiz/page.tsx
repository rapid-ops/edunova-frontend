'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Question {
  id: number;
  question: string;
  type: string;
  options: string[];
  correct_answer: string;
  marks: number;
  position: number;
}

export default function QuizPage() {
  const params = useSearchParams();
  const router = useRouter();
  const assessment_id = params.get('assessment_id');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [newQ, setNewQ] = useState({ question: '', type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 });
  const [showForm, setShowForm] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isTeacher = user.role === 'teacher' || user.role === 'school_admin' || user.role === 'super_admin';

  useEffect(() => {
    if (!assessment_id) return;
    fetch(`${API}/api/quiz/questions/${assessment_id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setQuestions(d.questions || []); setLoading(false); });
  }, [assessment_id]);

  const addQuestion = async () => {
    const res = await fetch(`${API}/api/quiz/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ assessment_id: Number(assessment_id), ...newQ, options: newQ.type === 'mcq' ? newQ.options.filter(Boolean) : null }),
    });
    const d = await res.json();
    setQuestions(prev => [...prev, d.question]);
    setNewQ({ question: '', type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 });
    setShowForm(false);
  };

  const submitQuiz = async () => {
    const res = await fetch(`${API}/api/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ assessment_id: Number(assessment_id), student_id: user.id, answers }),
    });
    const d = await res.json();
    setScore(d.score);
    setSubmitted(true);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button>
          <h1 className="text-xl font-bold text-gray-900">Quiz</h1>
          {isTeacher && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ Add Question</button>}
        </div>

        {showForm && isTeacher && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">New Question</h2>
            <textarea value={newQ.question} onChange={e => setNewQ({ ...newQ, question: e.target.value })} placeholder="Question text" className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none mb-3 resize-none" rows={2} />
            <div className="flex gap-3 mb-3">
              <select value={newQ.type} onChange={e => setNewQ({ ...newQ, type: e.target.value })} className="bg-gray-100 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="mcq">MCQ</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
              </select>
              <input type="number" value={newQ.marks} onChange={e => setNewQ({ ...newQ, marks: Number(e.target.value) })} placeholder="Marks" className="bg-gray-100 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none w-24" />
            </div>
            {newQ.type === 'mcq' && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {newQ.options.map((o, i) => (
                  <input key={i} value={o} onChange={e => { const opts = [...newQ.options]; opts[i] = e.target.value; setNewQ({ ...newQ, options: opts }); }} placeholder={`Option ${i + 1}`} className="bg-gray-100 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none" />
                ))}
              </div>
            )}
            <input value={newQ.correct_answer} onChange={e => setNewQ({ ...newQ, correct_answer: e.target.value })} placeholder="Correct answer" className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none mb-3" />
            <div className="flex gap-3">
              <button onClick={addQuestion} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Save Question</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{score}</div>
            <div className="text-gray-500 text-sm">points scored</div>
            <button onClick={() => router.back()} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="font-medium text-gray-900 mb-3">{i + 1}. {q.question} <span className="text-xs text-gray-400">({q.marks} mark{q.marks > 1 ? 's' : ''})</span></p>
                {q.type === 'mcq' && q.options?.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
                {q.type === 'true_false' && ['True', 'False'].map(opt => (
                  <label key={opt} className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
                {q.type === 'short_answer' && (
                  <input value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder="Your answer" className="w-full bg-gray-100 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none" />
                )}
              </div>
            ))}
            {!isTeacher && questions.length > 0 && (
              <button onClick={submitQuiz} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium">Submit Quiz</button>
            )}
            {questions.length === 0 && <div className="text-center text-gray-400 py-12">No questions added yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
