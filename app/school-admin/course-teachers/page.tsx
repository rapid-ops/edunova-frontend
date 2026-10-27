'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, UserCheck, UserX } from 'lucide-react';
import api from '@/lib/api';
import { friendlyError } from '@/lib/friendly-error';
import { useAuthStore } from '@/store/auth.store';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import FilterBar, { selectClass } from '@/components/admin/FilterBar';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';
import Skeleton from '@/components/admin/Skeleton';
import StatusBadge from '@/components/admin/StatusBadge';

interface Person { id: number; full_name: string; email: string }
interface CourseRow { id: number; title: string; is_published: boolean; class_name: string | null; teachers: Person[] }
interface Notice { ok: boolean; text: string }

const T = { timeout: 45000 };
const btn = 'inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50';

export default function CourseTeachersPage() {
  const { user } = useAuthStore();
  const schoolId = user?.school_id;
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [search, setSearch] = useState('');
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [pick, setPick] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState('');
  const [askRemove, setAskRemove] = useState('');

  const load = useCallback(async (quiet = false) => {
    if (!schoolId) return;
    if (!quiet) setLoading(true);
    setError('');
    try {
      const r = await api.get(`/course-assignments/overview/${schoolId}`, T);
      setCourses(r.data.courses || []);
      setTeachers(r.data.teachers || []);
    } catch (e) {
      setError(friendlyError(e, 'We could not load your courses. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (user && !schoolId) { setLoading(false); setError('Your account is not linked to a school, so there is nothing to show here.'); }
  }, [user, schoolId]);

  const assign = async (c: CourseRow) => {
    const tid = Number(pick[c.id]);
    if (!tid) { setNotice({ ok: false, text: 'Choose a teacher first.' }); return; }
    const t = teachers.find((x) => x.id === tid);
    setBusy(`add${c.id}`); setNotice(null);
    try {
      await api.post('/course-assignments', { course_id: c.id, teacher_id: tid }, T);
      setNotice({ ok: true, text: `${t ? t.full_name : 'The teacher'} now teaches ${c.title}.` });
      setPick((p) => ({ ...p, [c.id]: '' }));
      await load(true);
    } catch (e) {
      setNotice({ ok: false, text: friendlyError(e, 'The teacher could not be assigned. Please try again.') });
    } finally { setBusy(''); }
  };

  const remove = async (c: CourseRow, t: Person) => {
    setBusy(`rm${c.id}-${t.id}`); setNotice(null);
    try {
      await api.delete(`/course-assignments/${c.id}/${t.id}`, T);
      setNotice({ ok: true, text: `${t.full_name} no longer teaches ${c.title}.` });
      setAskRemove('');
      await load(true);
    } catch (e) {
      setNotice({ ok: false, text: friendlyError(e, 'The teacher could not be removed. Please try again.') });
    } finally { setBusy(''); }
  };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (onlyEmpty && c.teachers.length > 0) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || (c.class_name || '').toLowerCase().includes(q) || c.teachers.some((t) => t.full_name.toLowerCase().includes(q));
    });
  }, [courses, search, onlyEmpty]);
  const withTeacher = courses.filter((c) => c.teachers.length > 0).length;

  return (
    <div className="pb-10">
      <PageHeader title="Who teaches what" subtitle="Choose which teachers take each course." />
      <div className="space-y-4 px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Courses" value={courses.length} icon={BookOpen} loading={loading} />
          <StatCard label="Courses with a teacher" value={withTeacher} icon={UserCheck} tone="green" loading={loading} />
          <StatCard label="Courses without a teacher" value={courses.length - withTeacher} icon={UserX} tone="orange" loading={loading} />
        </div>
        {notice && (
          <div role="status" aria-live="polite" className={`rounded-xl px-4 py-3 text-sm ${notice.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{notice.text}</div>
        )}
        <FilterBar search={search} onSearch={setSearch} placeholder="Search courses or teachers">
          <select aria-label="Which courses to show" value={onlyEmpty ? 'empty' : 'all'} onChange={(e) => setOnlyEmpty(e.target.value === 'empty')} className={selectClass}>
            <option value="all">All courses</option>
            <option value="empty">Only courses without a teacher</option>
          </select>
        </FilterBar>
        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => load()} />
        ) : courses.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses yet" message="Create a course first, then come back here to choose who teaches it." />
        ) : shown.length === 0 ? (
          <EmptyState title="No courses match" message="Try a different word, or show all courses." />
        ) : (
          <ul className="space-y-3">
            {shown.map((c) => {
              const free = teachers.filter((t) => !c.teachers.some((x) => x.id === t.id));
              return (
                <li key={c.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-base font-bold text-[#0b1a4a]">{c.title}</h2>
                    <StatusBadge tone={c.is_published ? 'green' : 'gray'}>{c.is_published ? 'Published' : 'Draft'}</StatusBadge>
                    {c.class_name && <StatusBadge tone="blue">{c.class_name}</StatusBadge>}
                  </div>
                  <div className="mt-3">
                    {c.teachers.length === 0 ? (
                      <StatusBadge tone="orange">No teacher yet</StatusBadge>
                    ) : (
                      <ul className="space-y-2">
                        {c.teachers.map((t) => {
                          const key = `${c.id}-${t.id}`;
                          return (
                            <li key={t.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                              <div className="min-w-0 flex-1">
                                <p className="break-words text-sm font-medium text-slate-800">{t.full_name}</p>
                                <p className="break-words text-xs text-slate-500">{t.email}</p>
                              </div>
                              {askRemove === key ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-slate-600">Remove from this course?</span>
                                  <button type="button" disabled={busy === `rm${key}`} onClick={() => remove(c, t)} className={`${btn} bg-red-600 text-white`}>{busy === `rm${key}` ? 'Removing...' : 'Yes, remove'}</button>
                                  <button type="button" onClick={() => setAskRemove('')} className={`${btn} border border-slate-200 text-slate-700`}>Keep</button>
                                </div>
                              ) : (
                                <button type="button" onClick={() => setAskRemove(key)} className={`${btn} border border-red-200 text-red-600`}>Remove</button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <div className="mt-3">
                    {teachers.length === 0 ? (
                      <p className="text-sm text-slate-500">There are no teachers in this school yet. Add a teacher first, then assign them here.</p>
                    ) : free.length === 0 ? (
                      <p className="text-sm text-slate-500">Every teacher in your school already teaches this course.</p>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select aria-label={`Choose a teacher for ${c.title}`} value={pick[c.id] || ''} onChange={(e) => setPick((p) => ({ ...p, [c.id]: e.target.value }))} className={`${selectClass} min-w-0 flex-1`}>
                          <option value="">Choose a teacher</option>
                          {free.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                        </select>
                        <button type="button" disabled={busy === `add${c.id}`} onClick={() => assign(c)} className={`${btn} bg-blue-600 text-white`}>{busy === `add${c.id}` ? 'Assigning...' : 'Assign teacher'}</button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
