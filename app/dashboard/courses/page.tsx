'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { ArrowLeft, Plus, BookOpen, Eye, EyeOff, Trash2, ChevronRight } from 'lucide-react';

interface Course { id: number; title: string; description: string; teacher_name: string; is_published: boolean; }

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isAdmin = ['school_admin', 'super_admin'].includes(user.role);
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';
  const schoolId = user.school_id;

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      let res;
      if (isStudent) {
        res = await api.get(`/enrollments/student/${user.id}`);
        const enrollments = res.data.enrollments || [];
        setCourses(enrollments.map((e: any) => ({ id: e.course_id, title: e.course_title, description: '', teacher_name: '', is_published: true })));
      } else if (isTeacher) {
        res = await api.get(`/course-assignments/teacher/${user.id}`);
        setCourses((res.data.courses || []).map((c: any) => ({ id: c.course_id, title: c.title, description: c.description, teacher_name: '', is_published: c.is_published })));
      } else {
        res = await api.get(`/courses/school/${schoolId}`);
        setCourses(res.data.courses || []);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await api.post('/courses', { ...form, school_id: schoolId });
      setShowForm(false);
      setForm({ title: '', description: '' });
      fetchCourses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed');
    }
    setSaving(false);
  };

  const togglePublish = async (course: Course) => {
    try {
      await api.put(`/courses/${course.id}`, { title: course.title, description: course.description, is_published: !course.is_published });
      fetchCourses();
    } catch {}
  };

  const deleteCourse = async (id: number) => {
    try { await api.delete(`/courses/${id}`); setDeleteId(null); fetchCourses(); } catch {}
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><ArrowLeft size={20} className="text-gray-500" /></button>
          <h1 className="text-lg font-bold">Courses</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium">
            <Plus size={15} />Add Course
          </button>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {deleteId && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">Delete this course and all its lessons?</p>
            <div className="flex gap-2">
              <button onClick={() => deleteCourse(deleteId)} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium">Delete</button>
              <button onClick={() => setDeleteId(null)} className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-xs">Cancel</button>
            </div>
          </div>
        )}

        {showForm && isAdmin && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">New Course</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Course Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. JSS1 Mathematics" className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        )}

        {courses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{isStudent ? 'You are not enrolled in any courses yet.' : 'No courses yet.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map(c => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    {c.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{c.description}</p>}
                    {c.teacher_name && <p className="text-gray-400 text-xs mt-1">Teacher: {c.teacher_name}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 font-medium ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-600'}`}>
                    {c.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => router.push(`/dashboard/courses/${c.id}`)} className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                    <BookOpen size={14} />View Lessons
                  </button>
                  {(isAdmin || isTeacher) && (
                    <button onClick={() => togglePublish(c)} className="flex items-center gap-1.5 text-gray-500 text-sm">
                      {c.is_published ? <><EyeOff size={14} />Unpublish</> : <><Eye size={14} />Publish</>}
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => setDeleteId(c.id)} className="flex items-center gap-1.5 text-red-400 text-sm ml-auto">
                      <Trash2 size={14} />Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
