'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { FileText, Plus, ChevronRight, Clock, CheckCircle } from 'lucide-react';

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'No deadline';

export default function AssignmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState('');
  const [children, setChildren] = useState<any[]>([]);
  const [childId, setChildId] = useState('');
  const [error, setError] = useState('');

  const role = user?.role || '';
  const isStudent = role === 'student';
  const isParent = role === 'parent';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    let u: any = {};
    try { u = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
    setUser(u);

    if (u.role === 'student') {
      api.get('/assignments/me')
        .then(res => setItems(res.data.assignments || []))
        .catch(() => setError('Could not load assignments'))
        .finally(() => setLoading(false));
    } else if (u.role === 'parent') {
      api.get(`/parent/children/${u.id}`)
        .then(res => {
          const kids = res.data.children || [];
          setChildren(kids);
          if (kids.length > 0) setChildId(String(kids[0].id));
        })
        .catch(() => setError('Could not load your children'))
        .finally(() => setLoading(false));
    } else {
      if (u.school_id) {
        api.get(`/courses/school/${u.school_id}`)
          .then(res => setCourses(res.data.courses || []))
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setError('');
    if (isParent && childId) {
      api.get(`/assignments/child/${childId}`)
        .then(res => setItems(res.data.assignments || []))
        .catch(e => setError(e.response?.data?.error || 'Could not load assignments'));
    } else if (!isStudent && !isParent && courseId) {
      api.get(`/assignments/course/${courseId}`)
        .then(res => setItems(res.data.assignments || []))
        .catch(() => setError('Could not load assignments for that course'));
    }
  }, [courseId, childId, role]);

  if (loading) return <LoadingScreen />;

  const status = (a: any) => {
    if (a.status === 'graded') return { text: `Graded ${a.score}/${a.total_marks}`, cls: 'text-green-600', Icon: CheckCircle };
    if (a.status === 'submitted') return { text: 'Submitted', cls: 'text-blue-600', Icon: CheckCircle };
    const overdue = a.due_date && new Date(a.due_date) < new Date();
    return { text: overdue ? 'Overdue' : 'Not submitted', cls: overdue ? 'text-red-500' : 'text-gray-400', Icon: Clock };
  };

  const input = 'w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900';
  const showStatus = isStudent || isParent;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Assignments</h1>
        {!isStudent && !isParent && (
          <button
            onClick={() => router.push(`/dashboard/assignments/new${courseId ? `?course_id=${courseId}` : ''}`)}
            className="flex items-center gap-1 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg"
          >
            <Plus size={16} /> New
          </button>
        )}
      </div>

      <div className="px-4 py-4 space-y-3">
        {isParent && children.length > 1 && (
          <select value={childId} onChange={e => setChildId(e.target.value)} className={input}>
            {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        )}

        {!isStudent && !isParent && (
          courses.length > 0 ? (
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className={input}>
              <option value="">Select a course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          ) : (
            <input value={courseId} onChange={e => setCourseId(e.target.value)} type="number" placeholder="Course ID" className={input} />
          )
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}

        {items.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">
            {isParent && children.length === 0
              ? 'No children linked to your account'
              : showStatus ? 'No assignments yet'
              : courseId ? 'No assignments for this course' : 'Select a course to see its assignments'}
          </div>
        )}

        {items.map(a => {
          const s = showStatus ? status(a) : null;
          return (
            <button
              key={a.id}
              onClick={() => { if (!isParent) router.push(`/dashboard/assignments/${a.id}`); }}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 text-left"
            >
              <FileText size={20} className="text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{a.title}</p>
                {a.course_title && <p className="text-xs text-gray-400 truncate">{a.course_title}</p>}
                <p className="text-xs text-gray-400 mt-0.5">Due: {fmt(a.due_date)}</p>
                {s ? (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${s.cls}`}><s.Icon size={12} /> {s.text}</p>
                ) : (
                  <p className="text-xs mt-1 text-gray-400">{a.submission_count ?? 0} submission(s)</p>
                )}
              </div>
              {!isParent && <ChevronRight size={16} className="text-gray-300 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
