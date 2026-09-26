'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Session { id: number; title: string; code: string; course_title: string; is_active: boolean; question_count: number; created_at: string; }
interface Question { id: number; question: string; student_name: string; is_anonymous: boolean; teacher_answer: string; admin_answer: string; created_at: string; }
export default function ClassSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [form, setForm] = useState({ title: '', course_id: '' });
  const [joinCode, setJoinCode] = useState('');
  const [joinedSession, setJoinedSession] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isTeacher = user.role === 'teacher';
  const isAdmin = ['school_admin', 'super_admin'].includes(user.role);
  const isStudent = user.role === 'student';
  const loadSessions = () => { if (!isTeacher) return; fetch(`${API}/api/class-sessions/teacher/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setSessions(d.sessions || []); setLoading(false); }); };
  const loadQuestions = (session_id: number) => fetch(`${API}/api/class-sessions/${session_id}/questions`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setQuestions(d.questions || []));
  useEffect(() => { if (isTeacher) loadSessions(); else setLoading(false); }, []);
  const create = async () => { await fetch(`${API}/api/class-sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, school_id: user.school_id, teacher_id: user.id, course_id: Number(form.course_id) }) }); setForm({ title: '', course_id: '' }); setShowForm(false); loadSessions(); };
  const openSession = (s: Session) => { setActiveSession(s); loadQuestions(s.id); };
  const close = async (id: number) => { await fetch(`${API}/api/class-sessions/${id}/close`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }); loadSessions(); setActiveSession(null); };
  const join = async () => { const res = await fetch(`${API}/api/class-sessions/join/${joinCode}`); const d = await res.json(); if (d.session) { setJoinedSession(d.session); loadQuestions(d.session.id); } else alert('Invalid code'); };
  const ask = async () => { if (!question.trim() || !joinedSession) return; await fetch(`${API}/api/class-sessions/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ session_id: joinedSession.id, student_id: isAnon ? null : user.id, question, is_anonymous: isAnon }) }); setQuestion(''); loadQuestions(joinedSession.id); };
  const answerTeacher = async (id: number) => { await fetch(`${API}/api/class-sessions/questions/${id}/teacher-answer`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ answer: answers[id] }) }); setAnswers({ ...answers, [id]: '' }); if (activeSession) loadQuestions(activeSession.id); };
  const answerAdmin = async (id: number) => { await fetch(`${API}/api/class-sessions/questions/${id}/admin-answer`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ answer: answers[id] }) }); setAnswers({ ...answers, [id]: '' }); if (activeSession) loadQuestions(activeSession.id); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (isStudent || (!isTeacher && !isAdmin)) return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Join Class Session</h1></div>
        {!joinedSession ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <p className="text-sm text-gray-500 mb-3">Enter the code your teacher shared to join the Q&A session.</p>
            <div className="flex gap-3"><input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. A1B2C3" className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none font-mono tracking-widest" maxLength={6} /><button onClick={join} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Join</button></div>
          </div>
        ) : (
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4"><div className="font-semibold text-gray-900">{joinedSession.title}</div><div className="text-xs text-gray-400">{joinedSession.teacher_name} · {joinedSession.course_title}</div></div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
              <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask your question..." rows={3} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none mb-3" />
              <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer"><input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} className="accent-blue-600" />Ask anonymously</label><button onClick={ask} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Ask</button></div>
            </div>
            <div className="space-y-3">{questions.map(q => (<div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4"><div className="text-xs text-gray-400 mb-1">{q.student_name} · {new Date(q.created_at).toLocaleDateString()}</div><p className="text-sm text-gray-900 mb-2">{q.question}</p>{q.teacher_answer && <div className="bg-purple-50 rounded-lg p-2 mb-2"><p className="text-xs text-purple-600 font-medium">Teacher</p><p className="text-sm text-gray-700">{q.teacher_answer}</p></div>}{q.admin_answer && <div className="bg-blue-50 rounded-lg p-2"><p className="text-xs text-blue-600 font-medium">School Admin</p><p className="text-sm text-gray-700">{q.admin_answer}</p></div>}</div>))}</div>
          </div>
        )}
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">{activeSession ? activeSession.title : 'Class Sessions'}</h1></div>
          {!activeSession && isTeacher && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ New Session</button>}
          {activeSession && <button onClick={() => setActiveSession(null)} className="text-sm text-gray-500">← All Sessions</button>}
        </div>
        {!activeSession && showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Session title e.g. Chapter 3 Q&A" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <input value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} placeholder="Course ID" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <div className="flex gap-3"><button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create</button><button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
          </div>
        )}
        {!activeSession && (
          <div className="space-y-3">
            {sessions.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No sessions yet.</div> : sessions.map(s => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
                <div onClick={() => openSession(s)} className="cursor-pointer flex-1"><div className="font-medium text-gray-900">{s.title}</div><div className="text-xs text-gray-400 mt-1">{s.course_title} · {s.question_count} questions · Code: <span className="font-mono font-bold text-blue-600">{s.code}</span></div></div>
                <div className="flex gap-2">{s.is_active && <button onClick={() => close(s.id)} className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-lg">Close</button>}<span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{s.is_active ? 'Live' : 'Closed'}</span></div>
              </div>
            ))}
          </div>
        )}
        {activeSession && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between"><div><span className="text-xs text-blue-600 font-medium">Session Code</span><div className="font-mono font-bold text-2xl text-blue-600 tracking-widest">{activeSession.code}</div></div><span className="text-xs text-gray-400">Share this with students</span></div>
            {questions.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">No questions yet.</div> : questions.map(q => (
              <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">{q.student_name} · {new Date(q.created_at).toLocaleDateString()}</div>
                <p className="text-sm text-gray-900 font-medium mb-3">{q.question}</p>
                {q.teacher_answer ? <div className="bg-purple-50 rounded-lg p-2 mb-2"><p className="text-xs text-purple-600 font-medium">Your answer</p><p className="text-sm text-gray-700">{q.teacher_answer}</p></div> : isTeacher && <div className="flex gap-2 mb-2"><input value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder="Your answer..." className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" /><button onClick={() => answerTeacher(q.id)} className="bg-purple-600 text-white px-3 py-2 rounded-lg text-xs">Answer</button></div>}
                {q.admin_answer ? <div className="bg-blue-50 rounded-lg p-2"><p className="text-xs text-blue-600 font-medium">Admin answer</p><p className="text-sm text-gray-700">{q.admin_answer}</p></div> : isAdmin && <div className="flex gap-2"><input value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder="Admin answer..." className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" /><button onClick={() => answerAdmin(q.id)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs">Answer</button></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
