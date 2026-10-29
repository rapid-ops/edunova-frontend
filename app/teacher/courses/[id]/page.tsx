'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Users, ClipboardCheck, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import StatusBadge from '@/components/admin/StatusBadge';
import ErrorState from '@/components/admin/ErrorState';
import Skeleton from '@/components/admin/Skeleton';
import EmptyState from '@/components/admin/EmptyState';

interface Course { id: number; title: string; description: string | null; is_published: boolean; }
interface Lesson { id: number; title: string; content?: string | null; position?: number | null; duration_minutes?: number | null; }

const lessonsHref = (id: number) => '/dashboard/courses/' + id;
const actionClass = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';

export default function TeacherCourseHubPage() {
  const params = useParams();
  const raw = params?.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { setIsNew(new URLSearchParams(window.location.search).get('new') === '1'); }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const c = await api.get('/courses/' + id);
      setCourse(c.data.course);
      try {
        const l = await api.get('/lessons/course/' + id);
        setLessons(l.data.lessons || []);
      } catch { setLessons([]); }
    } catch (e: any) {
      const st = e.response?.status;
      setError(st === 403 ? 'You do not have access to this course.' : st === 404 ? 'We could not find this course.' : 'We could not load this course. Check your connection and try again.');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const togglePublish = async () => {
    if (!course) return;
    setBusy(true);
    setMessage('');
    try {
      await api.put('/courses/' + course.id, { is_published: !course.is_published });
      setCourse({ ...course, is_published: !course.is_published });
      setMessage(!course.is_published ? 'The course is now published.' : 'The course is now a draft.');
    } catch (e: any) {
      setMessage(e.response?.data?.error || 'We could not change that. Please try again.');
    }
    setBusy(false);
  };

  if (!id) return null;
  const sorted = [...lessons].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.id - b.id);

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <Link href="/teacher/courses" className="mb-4 inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-blue-600">
        <ChevronLeft size={16} />My courses
      </Link>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : error || !course ? (
        <ErrorState message={error || 'We could not load this course.'} onRetry={load} />
      ) : (
        <div className="space-y-4">
          {isNew && (
            <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Your course is ready. Look through the lessons below, change anything you like, then publish it when you are happy.
            </div>
          )}
          {message && <div role="status" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">{message}</div>}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h1 className="min-w-0 flex-1 break-words text-xl font-bold text-gray-900">{course.title}</h1>
              <StatusBadge tone={course.is_published ? 'green' : 'orange'}>{course.is_published ? 'Published' : 'Draft'}</StatusBadge>
            </div>
            {course.description && <p className="mt-2 break-words text-sm text-gray-600">{course.description}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Link href={lessonsHref(course.id)} className={actionClass}><BookOpen size={15} />Add or edit lessons</Link>
              <Link href={'/teacher/courses/' + course.id + '/students'} className={actionClass}><Users size={15} />Students</Link>
              <Link href={'/teacher/assessments?course=' + course.id} className={actionClass}><ClipboardCheck size={15} />Assignments and quizzes</Link>
              <button type="button" disabled={busy} onClick={togglePublish} className={actionClass}>
                {course.is_published ? <EyeOff size={15} /> : <Eye size={15} />}{course.is_published ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Lessons ({sorted.length})</h2>
            {sorted.length === 0 ? (
              <EmptyState title="No lessons yet" message="Use Add or edit lessons to add the first one." />
            ) : (
              <ol className="space-y-2">
                {sorted.map((l, i) => (
                  <li key={l.id} className="rounded-xl border border-gray-200 bg-white p-3">
                    <p className="break-words text-sm font-semibold text-gray-900">{i + 1}. {l.title}</p>
                    {l.content && <p className="mt-1 line-clamp-2 break-words text-xs text-gray-600">{String(l.content).replace(/<[^>]*>/g, '').slice(0, 160)}</p>}
                    {l.duration_minutes ? <p className="mt-1 text-xs text-gray-400">{l.duration_minutes} minutes</p> : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
