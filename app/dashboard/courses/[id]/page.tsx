'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { ArrowLeft, Plus, Trash2, Video, FileText, BookOpen, Eye, EyeOff, ChevronRight } from 'lucide-react';

interface Lesson { id: number; title: string; content: string; video_url: string; position: number; }
interface Course { id: number; title: string; description: string; is_published: boolean; }

export default function CourseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', video_url: '', position: '0' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isTeacherOrAdmin = ['teacher','school_admin','super_admin'].includes(user.role);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/lessons/course/${id}`),
      ]);
      setCourse(courseRes.data.course);
      setLessons(lessonsRes.data.lessons || []);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await api.post('/lessons', { ...form, course_id: id, position: Number(form.position) });
      setShowForm(false);
      setForm({ title: '', content: '', video_url: '', position: String(lessons.length) });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create lesson');
    }
    setSaving(false);
  };

  const togglePublish = async () => {
    try {
      await api.put(`/courses/${id}`, { is_published: !course?.is_published });
      setCourse(c => c ? { ...c, is_published: !c.is_published } : c);
    } catch {}
  };

  const deleteLesson = async (lessonId: number) => {
    try { await api.delete(`/lessons/${lessonId}`); setDeleteId(null); fetchData(); } catch {}
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => router.back()}><ArrowLeft size={20} className="text-gray-500" /></button>
          <div className="flex items-center gap-2">
            {isTeacherOrAdmin && (
              <button onClick={togglePublish} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium ${course?.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {course?.is_published ? <><Eye size={12} />Published</> : <><EyeOff size={12} />Draft</>}
              </button>
            )}
            {isTeacherOrAdmin && (
              <button onClick={() => { setShowForm(true); setForm({ title: '', content: '', video_url: '', position: String(lessons.length) }); }} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                <Plus size={12} />Add Lesson
              </button>
            )}
          </div>
        </div>
        <h1 className="text-lg font-bold text-gray-900">{course?.title}</h1>
        {course?.description && <p className="text-sm text-gray-400 mt-0.5">{course.description}</p>}
        <p className="text-xs text-gray-400 mt-1">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {deleteId && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">Delete this lesson?</p>
            <div className="flex gap-2">
              <button onClick={() => deleteLesson(deleteId)} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium">Delete</button>
              <button onClick={() => setDeleteId(null)} className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-xs">Cancel</button>
            </div>
          </div>
        )}

        {showForm && isTeacherOrAdmin && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FileText size={16} className="text-blue-600" />New Lesson</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Lesson Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Introduction to Algebra" className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Content</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write lesson content here. The AI tutor will use this to answer student questions." rows={5} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Video URL (optional)</label>
              <input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Lesson'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        )}

        {lessons.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{isTeacherOrAdmin ? 'No lessons yet. Tap + Add Lesson to start.' : 'No lessons available yet.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((l, i) => (
              <div key={l.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <button className="w-full text-left" onClick={() => router.push(`/dashboard/lessons/${l.id}`)}>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{l.title}</h3>
                      {l.content && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{l.content}</p>}
                      {l.video_url && (
                        <span className="flex items-center gap-1 text-blue-600 text-xs mt-1.5">
                          <Video size={11} />Has video
                        </span>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-gray-300 shrink-0 mt-0.5" />
                  </div>
                </button>
                {isTeacherOrAdmin && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                    <button onClick={() => setDeleteId(l.id)} className="flex items-center gap-1 text-red-400 text-xs">
                      <Trash2 size={12} />Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
