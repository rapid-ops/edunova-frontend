'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Eye, EyeOff, Users, BookOpen, ClipboardCheck, ChevronLeft } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';
import Skeleton from '@/components/admin/Skeleton';

interface Course {
  id: number;
  title: string;
  description: string | null;
  is_published: boolean;
  teacher_id?: number | null;
  class_name?: string | null;
  student_count?: number;
  lesson_count?: number;
  assessment_count?: number;
}
interface ClassOption { id: number; name: string; }
interface FormState { title: string; description: string; class_id: string; published: boolean; }
interface Notice { tone: 'ok' | 'bad'; text: string; }

const emptyForm: FormState = { title: '', description: '', class_id: '', published: false };
const lessonsHref = (id: number) => '/dashboard/courses/' + id;
const inputClass = 'w-full min-h-[44px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500';
const actionClass = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';
const primaryClass = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50';

export default function TeacherCoursesPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setLoadError('');
    try {
      let list: Course[] = [];
      try {
        const r = await api.get('/courses/mine');
        list = r.data.courses || [];
      } catch {
        const r = await api.get('/courses/school/' + user.school_id);
        list = (r.data.courses || []).filter((c: Course) => Number(c.teacher_id) === Number(user.id));
      }
      setCourses(list);
    } catch (e: any) {
      setLoadError(e.response?.data?.error || 'We could not load your courses. Check your connection and try again.');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user?.school_id) return;
    (async () => {
      try {
        const r = await api.get('/classes/school/' + user.school_id);
        const list = r.data.classes;
        if (Array.isArray(list)) setClasses(list.map((c: any) => ({ id: c.id, name: c.name })));
      } catch {}
    })();
  }, [user]);

  const openCreate = () => {
    setEditingId(null); setForm(emptyForm); setFormError(''); setNotice(null); setView('form');
  };
  const openEdit = (c: Course) => {
    setEditingId(c.id);
    setForm({ title: c.title, description: c.description || '', class_id: '', published: c.is_published });
    setFormError(''); setNotice(null); setView('form');
  };

  const save = async () => {
    const title = form.title.trim();
    if (!title) { setFormError('Give the course a title.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingId === null) {
        const body: { title: string; description: string; class_id?: number } = { title, description: form.description.trim() };
        if (form.class_id) body.class_id = Number(form.class_id);
        const r = await api.post('/courses', body);
        const created = r.data.course;
        let text = 'Your course "' + title + '" is ready. Add lessons next.';
        if (form.published && created?.id) {
          try { await api.put('/courses/' + created.id, { is_published: true }); }
          catch { text = 'Your course "' + title + '" was created as a draft. We could not publish it yet, so use Publish when you are ready.'; }
        }
        setNotice({ tone: 'ok', text });
      } else {
        await api.put('/courses/' + editingId, { title, description: form.description.trim(), is_published: form.published });
        setNotice({ tone: 'ok', text: 'Your changes to "' + title + '" are saved.' });
      }
      setView('list'); setEditingId(null); setForm(emptyForm);
      await load();
    } catch (e: any) {
      setFormError(e.response?.data?.error || 'We could not save the course. Please try again.');
    }
    setSaving(false);
  };

  const togglePublish = async (c: Course) => {
    setBusyId(c.id);
    setNotice(null);
    try {
      await api.put('/courses/' + c.id, { is_published: !c.is_published });
      setCourses((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_published: !c.is_published } : x)));
      setNotice({ tone: 'ok', text: !c.is_published ? '"' + c.title + '" is now published.' : '"' + c.title + '" is now a draft.' });
    } catch (e: any) {
      setNotice({ tone: 'bad', text: e.response?.data?.error || 'We could not change that. Please try again.' });
    }
    setBusyId(null);
  };

  if (view === 'form') {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <button type="button" onClick={() => { setView('list'); setFormError(''); }} className="mb-4 inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-blue-600">
          <ChevronLeft size={16} />Back to my courses
        </button>
        <h2 className="mb-1 text-xl font-bold text-gray-900">{editingId === null ? 'Create a course' : 'Edit course'}</h2>
        <p className="mb-5 text-sm text-gray-500">
          {editingId === null
            ? 'Give your course a name and a short description. You can add lessons after you save.'
            : 'Change the name, the description, or whether students can see this course.'}
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="course-title" className="mb-1 block text-sm font-medium text-gray-700">Course title</label>
            <input id="course-title" value={form.title} maxLength={255} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="For example: JSS1 Mathematics" className={inputClass} />
          </div>
          <div>
            <label htmlFor="course-desc" className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea id="course-desc" value={form.description} rows={4} maxLength={5000} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will students learn in this course?" className={inputClass} />
          </div>
          {editingId === null && classes.length > 0 && (
            <div>
              <label htmlFor="course-class" className="mb-1 block text-sm font-medium text-gray-700">Class (optional)</label>
              <select id="course-class" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className={inputClass}>
                <option value="">No class</option>
                {classes.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
            </div>
          )}
          <button type="button" role="switch" aria-checked={form.published} onClick={() => setForm({ ...form, published: !form.published })}
            className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 text-left">
            <span className="min-w-0">
              <span className="block text-sm font-medium text-gray-800">{form.published ? 'Published' : 'Draft'}</span>
              <span className="block text-xs text-gray-500">Keep it as a draft while you are still preparing the course.</span>
            </span>
            <span className={'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ' + (form.published ? 'bg-blue-600' : 'bg-gray-300')}>
              <span className={'inline-block h-5 w-5 rounded-full bg-white transition-transform ' + (form.published ? 'translate-x-6' : 'translate-x-1')} />
            </span>
          </button>
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} disabled={saving} className={primaryClass}>{saving ? 'Saving...' : editingId === null ? 'Create course' : 'Save changes'}</button>
            <button type="button" onClick={() => { setView('list'); setFormError(''); }} className={actionClass}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <PageHeader
        title="My courses"
        subtitle="Create your courses, add lessons, and see who is enrolled."
        actions={<button type="button" onClick={openCreate} className={primaryClass}><Plus size={16} />Create course</button>}
      />
      {notice && (
        <div role="status" className={'mb-4 rounded-xl border px-4 py-3 text-sm ' + (notice.tone === 'ok' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700')}>
          {notice.text}
        </div>
      )}
      {loading || !user ? (
        <div className="space-y-3">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={load} />
      ) : courses.length === 0 ? (
        <EmptyState
          title="You have no courses yet"
          message="Create your first course, then add lessons and set assignments and quizzes for your students."
          action={<button type="button" onClick={openCreate} className={primaryClass}><Plus size={16} />Create your first course</button>}
        />
      ) : (
        <ul className="space-y-3">
          {courses.map((c) => (
            <li key={c.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-base font-semibold text-gray-900">{c.title}</h3>
                  {c.class_name && <p className="mt-0.5 text-xs text-gray-500">Class: {c.class_name}</p>}
                </div>
                <StatusBadge tone={c.is_published ? 'green' : 'orange'}>{c.is_published ? 'Published' : 'Draft'}</StatusBadge>
              </div>
              {c.description && <p className="mt-2 line-clamp-2 break-words text-sm text-gray-600">{c.description}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                {typeof c.student_count === 'number' && <span>{c.student_count} {c.student_count === 1 ? 'student' : 'students'}</span>}
                {typeof c.lesson_count === 'number' && <span>{c.lesson_count} {c.lesson_count === 1 ? 'lesson' : 'lessons'}</span>}
                {typeof c.assessment_count === 'number' && <span>{c.assessment_count} {c.assessment_count === 1 ? 'assignment or quiz' : 'assignments and quizzes'}</span>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Link href={lessonsHref(c.id)} className={actionClass}><BookOpen size={15} />Lessons</Link>
                <Link href={'/teacher/courses/' + c.id + '/students'} className={actionClass}><Users size={15} />Students</Link>
                <Link href={'/teacher/assessments?course=' + c.id} className={actionClass}><ClipboardCheck size={15} />Assignments and quizzes</Link>
                <button type="button" onClick={() => openEdit(c)} className={actionClass}><Pencil size={15} />Edit</button>
                <button type="button" disabled={busyId === c.id} onClick={() => togglePublish(c)} className={actionClass}>
                  {c.is_published ? <EyeOff size={15} /> : <Eye size={15} />}{c.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
