'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { friendlyError } from '@/lib/friendly-error';
import { useAuthStore } from '@/store/auth.store';
import PageHeader from '@/components/admin/PageHeader';
import FilterBar, { selectClass } from '@/components/admin/FilterBar';
import Pagination from '@/components/admin/Pagination';
import Avatar from '@/components/admin/Avatar';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';
import Skeleton from '@/components/admin/Skeleton';

interface Enrolled { id: number; student_id: number; full_name: string; email: string }
interface CourseInfo { id: number; title: string; is_published: boolean; allow_self_enrollment: boolean; can_manage: boolean }
interface Candidate { id: number; full_name: string; email: string; class_names: string | null }
interface ClassRow { id: number; name: string; grade_level: string | null; student_count: number }
interface Notice { ok: boolean; text: string }

const T = { timeout: 45000 };
const PAGE = 15;
const btn = 'inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50';
const card = 'rounded-2xl border border-slate-100 bg-white p-4 shadow-sm';

export default function EnrollPanel({ courseId, requireManage = false, backHref }: { courseId: string | number; requireManage?: boolean; backHref?: string }) {
  const { user } = useAuthStore();
  const schoolId = user?.school_id;
  const cid = Number(courseId);
  const [students, setStudents] = useState<Enrolled[]>([]);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [askRemove, setAskRemove] = useState<number | null>(null);
  const [busy, setBusy] = useState('');
  const [cq, setCq] = useState('');
  const [cands, setCands] = useState<Candidate[]>([]);
  const [cLoading, setCLoading] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classId, setClassId] = useState('');
  const canManage = !!course?.can_manage;
  const noteRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (notice && noteRef.current) noteRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [notice]);

  const loadRoster = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const r = await api.get(`/enrollments/course/${cid}`, T);
      setStudents(r.data.enrollments || []);
      setCourse(r.data.course || null);
    } catch (e) {
      setError(friendlyError(e, 'We could not load the students. Please try again.'));
    } finally { setLoading(false); }
  }, [cid]);
  useEffect(() => { loadRoster(); }, [loadRoster]);

  const loadCands = useCallback(async () => {
    setCLoading(true);
    try {
      const r = await api.get(`/enrollments/course/${cid}/candidates`, { ...T, params: { q: cq } });
      setCands(r.data.students || []);
    } catch (e) {
      setCands([]);
      setNotice({ ok: false, text: friendlyError(e, 'We could not search for students. Please try again.') });
    } finally { setCLoading(false); }
  }, [cid, cq]);
  useEffect(() => {
    if (!canManage) return undefined;
    const t = setTimeout(() => { loadCands(); }, 300);
    return () => clearTimeout(t);
  }, [canManage, loadCands]);

  useEffect(() => {
    if (!canManage || !schoolId) return;
    api.get(`/classes/school/${schoolId}`, T).then((r) => setClasses(r.data.classes || [])).catch(() => setClasses([]));
  }, [canManage, schoolId]);

  const refresh = async () => { await loadRoster(true); await loadCands(); };

  const addPicked = async () => {
    if (!picked.length) return;
    setBusy('add'); setNotice(null);
    try {
      const r = await api.post('/enrollments/bulk', { course_id: cid, student_ids: picked }, T);
      setNotice({ ok: true, text: r.data.message || 'The students were added.' });
      setPicked([]);
      await refresh();
    } catch (e) {
      setNotice({ ok: false, text: friendlyError(e, 'The students could not be added. Please try again.') });
    } finally { setBusy(''); }
  };

  const addClass = async () => {
    if (!classId) return;
    setBusy('class'); setNotice(null);
    try {
      const r = await api.post('/enrollments/bulk', { course_id: cid, class_id: Number(classId) }, T);
      setNotice({ ok: true, text: r.data.message || 'The class was added.' });
      await refresh();
    } catch (e) {
      setNotice({ ok: false, text: friendlyError(e, 'The class could not be added. Please try again.') });
    } finally { setBusy(''); }
  };

  const removeOne = async (s: Enrolled) => {
    setBusy(`rm${s.student_id}`); setNotice(null);
    try {
      await api.delete('/enrollments', { ...T, data: { student_id: s.student_id, course_id: cid } });
      setNotice({ ok: true, text: `${s.full_name} was removed from this course.` });
      setAskRemove(null);
      await refresh();
    } catch (e) {
      setNotice({ ok: false, text: friendlyError(e, 'The student could not be removed. Please try again.') });
    } finally { setBusy(''); }
  };

  const toggleSelf = async () => {
    if (!course) return;
    setBusy('self'); setNotice(null);
    try {
      const r = await api.put(`/enrollments/course/${cid}/self-enrollment`, { allow: !course.allow_self_enrollment }, T);
      setCourse({ ...course, allow_self_enrollment: !!r.data.course.allow_self_enrollment });
    } catch (e) {
      setNotice({ ok: false, text: friendlyError(e, 'The setting could not be changed. Please try again.') });
    } finally { setBusy(''); }
  };

  const ql = q.trim().toLowerCase();
  const filtered = students.filter((s) => !ql || s.full_name.toLowerCase().includes(ql) || s.email.toLowerCase().includes(ql));
  const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE));
  const cur = Math.min(page, lastPage);
  const rows = filtered.slice((cur - 1) * PAGE, cur * PAGE);
  const back = backHref ? (
    <Link href={backHref} className={`${btn} border border-slate-200 text-slate-700`}><ArrowLeft className="mr-1 h-4 w-4" />Back to course</Link>
  ) : undefined;

  if (loading) return (<div><PageHeader title="Course students" actions={back} /><div className="space-y-3 px-4 lg:px-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-40 w-full" /></div></div>);
  if (error) return (<div><PageHeader title="Course students" actions={back} /><ErrorState message={error} onRetry={() => loadRoster()} /></div>);
  if (requireManage && !canManage) return (<div><PageHeader title="Course students" actions={back} /><EmptyState title="This is not one of your courses" message="You can only see and change the students of courses you teach." /></div>);

  return (
    <div className="pb-10">
      <PageHeader title={course?.title || 'Course students'} subtitle="Add or remove the students who take this course." actions={back} />
      <div className="space-y-4 px-4 lg:px-6">
        {notice && (<div ref={noteRef} role="status" aria-live="polite" className={`rounded-xl px-4 py-3 text-sm ${notice.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{notice.text}</div>)}
        {!canManage && (<div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">You can look at this list, but only the course teacher or a school administrator can change it.</div>)}

        {canManage && course && (
          <div className={`${card} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0b1a4a]">Let students join this course themselves</p>
              <p className="mt-0.5 text-xs text-slate-500">{course.is_published ? 'When this is on, students can add themselves to the course without asking you.' : 'This course is still a draft, so students cannot join it yet. Publish the course first.'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">{course.allow_self_enrollment ? 'On' : 'Off'}</span>
              <button type="button" role="switch" aria-checked={course.allow_self_enrollment} aria-label="Let students join this course themselves" disabled={busy === 'self'} onClick={toggleSelf}
                className={`relative h-11 w-16 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 ${course.allow_self_enrollment ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <span className={`absolute left-1 top-1 h-9 w-9 rounded-full bg-white shadow transition-transform ${course.allow_self_enrollment ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {canManage && (
          <section className={card}>
            <h2 className="text-sm font-semibold text-[#0b1a4a]">Add students</h2>
            <p className="mt-0.5 text-xs text-slate-500">Tick the students you want, then press the add button.</p>
            <div className="mt-3 space-y-3">
              <FilterBar search={cq} onSearch={setCq} placeholder="Search students by name or email" />
              {cLoading ? (<Skeleton className="h-24 w-full" />) : cands.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">{cq.trim() ? 'No students match your search, or they are already in this course.' : 'Every student in your school is already in this course.'}</p>
              ) : (
                <ul className="max-h-80 divide-y divide-slate-50 overflow-y-auto rounded-xl border border-slate-100">
                  {cands.map((c) => (
                    <li key={c.id}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 hover:bg-blue-50/40">
                        <input type="checkbox" className="h-5 w-5 shrink-0 accent-blue-600" checked={picked.includes(c.id)} onChange={() => setPicked((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))} />
                        <Avatar name={c.full_name} size={32} />
                        <span className="min-w-0 flex-1">
                          <span className="block break-words text-sm font-medium text-slate-800">{c.full_name}</span>
                          <span className="block break-words text-xs text-slate-500">{c.email}{c.class_names ? ` - ${c.class_names}` : ''}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={addPicked} disabled={!picked.length || busy === 'add'} className={`${btn} bg-blue-600 text-white`}>{busy === 'add' ? 'Adding...' : picked.length ? `Add ${picked.length} selected` : 'Add selected students'}</button>
                {cands.length > 0 && (<button type="button" onClick={() => setPicked(picked.length === cands.length ? [] : cands.map((c) => c.id))} className={`${btn} border border-slate-200 text-slate-700`}>{picked.length === cands.length ? 'Clear ticks' : 'Tick all shown'}</button>)}
              </div>
            </div>
          </section>
        )}

        {canManage && (
          <section className={card}>
            <h2 className="text-sm font-semibold text-[#0b1a4a]">Add a whole class</h2>
            <p className="mt-0.5 text-xs text-slate-500">Everyone in the class is added. Students who are already in the course are skipped.</p>
            {classes.length === 0 ? (
              <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Your school has no classes yet. Create a class first, then you can add it here.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <select aria-label="Choose a class" value={classId} onChange={(e) => setClassId(e.target.value)} className={`${selectClass} min-w-0 flex-1`}>
                  <option value="">Choose a class</option>
                  {classes.map((c) => (<option key={c.id} value={c.id}>{`${c.name}${c.grade_level ? ` (${c.grade_level})` : ''} - ${c.student_count} ${c.student_count === 1 ? 'student' : 'students'}`}</option>))}
                </select>
                <button type="button" onClick={addClass} disabled={!classId || busy === 'class'} className={`${btn} bg-blue-600 text-white`}>{busy === 'class' ? 'Adding...' : 'Add this class'}</button>
              </div>
            )}
          </section>
        )}

        <section className={card}>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-[#0b1a4a]">Students in this course</h2>
            <StatusBadge tone="blue">{students.length}</StatusBadge>
          </div>
          <div className="mt-3"><FilterBar search={q} onSearch={(v) => { setQ(v); setPage(1); }} placeholder="Search students in this course" /></div>
          {students.length === 0 ? (
            <EmptyState title="No students yet" message={canManage ? 'Use the boxes above to add students or a whole class.' : 'Students will appear here once they join.'} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No one matches" message="Try a different name or email." />
          ) : (
            <>
              <ul className="mt-2 divide-y divide-slate-50">
                {rows.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Avatar name={s.full_name} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-slate-800">{s.full_name}</p>
                      <p className="break-words text-xs text-slate-500">{s.email}</p>
                    </div>
                    {canManage && (askRemove === s.student_id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-600">Remove from this course?</span>
                        <button type="button" disabled={busy === `rm${s.student_id}`} onClick={() => removeOne(s)} className={`${btn} bg-red-600 text-white`}>{busy === `rm${s.student_id}` ? 'Removing...' : 'Yes, remove'}</button>
                        <button type="button" onClick={() => setAskRemove(null)} className={`${btn} border border-slate-200 text-slate-700`}>Keep</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setAskRemove(s.student_id)} className={`${btn} border border-red-200 text-red-600`}>Remove</button>
                    ))}
                  </li>
                ))}
              </ul>
              <Pagination page={cur} pageSize={PAGE} total={filtered.length} onPage={setPage} noun="students" />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
