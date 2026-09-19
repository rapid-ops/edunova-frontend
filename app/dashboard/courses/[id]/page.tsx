'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

interface Lesson {
  id: number;
  title: string;
  content: string;
  video_url: string;
  position: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', video_url: '', position: '0' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/lessons/course/${id}`),
      ]);
      setCourse(courseRes.data.course);
      setLessons(lessonsRes.data.lessons);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/lessons', { ...form, course_id: id, position: Number(form.position) });
      setShowForm(false);
      setForm({ title: '', content: '', video_url: '', position: '0' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create lesson');
    }
  };

  const deleteLesson = async (lessonId: number) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      fetchData();
    } catch (err) {}
  };

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/courses')} className="text-gray-400 hover:text-white">←</button>
          <div>
            <h1 className="text-xl font-bold">{course?.title}</h1>
            <p className="text-gray-400 text-xs">{course?.description}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          + Add Lesson
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="font-semibold">New Lesson</h2>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Introduction to Algebra"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Lesson content..."
                rows={4}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Video URL (optional)</label>
              <input
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="https://youtube.com/..."
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Position</label>
              <input
                type="number"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {lessons.length === 0 ? (
          <p className="text-gray-400">No lessons yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {lessons.map((l, i) => (
              <div key={l.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">#{i + 1}</span>
                      <h3 className="font-semibold">{l.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{l.content}</p>
                    {l.video_url && (
                      <a href={l.video_url} target="_blank" className="text-blue-400 text-xs mt-1 block">Video link</a>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLesson(l.id)}
                    className="text-red-400 hover:text-red-300 text-sm ml-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
