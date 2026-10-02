'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { ClipboardCheck, Plus, ChevronRight, Clock, CheckCircle } from 'lucide-react';

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'No closing date';

export default function QuizzesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');

  const role = user?.role || '';
  const isStudent = role === 'student';
  const isStaff = ['teacher', 'school_admin', 'super_admin'].includes(role);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    let u: any = {};
    try { u = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
    setUser(u);
    if (u.role === 'student') {
      api.get('/quiz/me')
        .then(res => setItems(res.data.quizzes || []))
        .catch(() => setError('Could not load quizzes'))
        .finally(() => setLoading(false));
    } else if (['teacher', 'school_admin', 'super_admin'].includes(u.role) && u.school_id) {
      api.get(`/courses/school/${u.school_id}`)
        .then(res => setCourses(res.data.courses || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isStaff || !courseId) return;
    setError('');
    api.get(`/quiz/course/${courseId}`)
      .then(res => setItems(res.data.quizzes || []))
      .catch(() => setError('Could not load quizzes for that course'));
  }, [courseId, role]);

  if (loading) return <LoadingScreen />;

  const input = 'w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900';

  const status = (q: any) => {
    if (q.attempt_status === 'in_progress') return { text: 'In progress', cls: 'text-blue-600', Icon: Clock };
    if (q.attempt_status === 'submitted') {
      return {
        text: `Best ${q.best_score ?? 0}/${q.total_marks}${q.passed ? ' · Passed' : ''}`,
        cls: q.passed ? 'text-green-600' : 'text-gray-500',
        Icon: CheckCircle,
      };
    }
    return { text: 'Not started', cls: 'text-gray-400', Icon: Clock };
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Quizzes</h1>
        {isStaff && (
          <button
            onClick={() => router.push(`/dashboard/quizzes/new${courseId ? `?course_id=${courseId}` : ''}`)}
            className="flex items-center gap-1 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg"
          >
            <Plus size={16} /> New
          </button>
        )}
      </div>

      <div className="px-4 py-4 space-y-3">
        {isStaff && (
          courses.length > 0 ? (
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className={input}>
              <option value="">Select a course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          ) : (
            <input value={courseId} onChange={e => setCourseId(e.target.value)} type="number" placeholder="Course ID" className={input} />
          )
        )}

        {!isStudent && !isStaff && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">Quizzes are for students and teachers</div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}

        {(isStudent || isStaff) && items.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">
            {isStudent ? 'No quizzes yet' : courseId ? 'No quizzes for this course' : 'Select a course to see its quizzes'}
          </div>
        )}

        {items.map(q => {
          const s = isStudent ? status(q) : null;
          return (
            <button key={q.id} onClick={() => router.push(`/dashboard/quizzes/${q.id}`)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 text-left">
              <ClipboardCheck size={20} className="text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{q.title}</p>
                {q.course_title && <p className="text-xs text-gray-400 truncate">{q.course_title}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  {q.question_count} question{q.question_count === 1 ? '' : 's'}
                  {q.time_limit_minutes ? ` · ${q.time_limit_minutes} min` : ''}
                  {' · '}{fmt(q.due_date)}
                </p>
                {s ? (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${s.cls}`}><s.Icon size={12} /> {s.text} · {q.attempts_used}/{q.max_attempts} attempts</p>
                ) : (
                  <p className="text-xs mt-1 text-gray-400">{q.students_attempted ?? 0} student(s) attempted</p>
                )}
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
