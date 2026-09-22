'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Course {
  id: number;
  title: string;
  description: string;
  teacher_name: string;
  is_published: boolean;
}

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.school_id || 1;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get(`/courses/school/${schoolId}`);
      setCourses(res.data.courses);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/courses', { ...form, school_id: schoolId });
      setShowForm(false);
      setForm({ title: '', description: '' });
      fetchCourses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed');
    }
  };

  const togglePublish = async (course: Course) => {
    try {
      await api.put(`/courses/${course.id}`, { title: course.title, description: course.description, is_published: !course.is_published });
      fetchCourses();
    } catch (err) {}
  };

  const deleteCourse = async (id: number) => {
    if (!confirm('Delete this course?')) return;
    try { await api.delete(`/courses/${id}`); fetchCourses(); } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-xl font-bold">Courses</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">+ Add Course</button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="font-semibold">New Course</h2>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. JSS1 Mathematics" className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {loading ? <p className="text-gray-400">Loading...</p> : courses.length === 0 ? (
          <p className="text-gray-400">No courses yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{c.description}</p>
                    <p className="text-gray-500 text-xs mt-2">Teacher: {c.teacher_name || 'Unassigned'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ml-3 ${c.is_published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {c.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => router.push(`/dashboard/courses/${c.id}`)} className="text-blue-400 text-sm">View Lessons</button>
                  <button onClick={() => togglePublish(c)} className="text-gray-400 text-sm">{c.is_published ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={() => deleteCourse(c.id)} className="text-red-400 text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
