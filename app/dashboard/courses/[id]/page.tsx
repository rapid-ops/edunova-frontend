'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import { ArrowLeft, Plus, Trash2, Video, FileText, BookOpen, Eye, EyeOff, ChevronRight, Clock, CheckCircle, Lock, PlayCircle, Star, Bookmark, BookmarkCheck } from 'lucide-react';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

interface Lesson { id: number; title: string; content: string; video_url: string; position: number; }
interface Course { id: number; title: string; description: string; is_published: boolean; teacher_name?: string; }

export default function CourseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [completionPct, setCompletionPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', video_url: '', position: '0' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isTeacherOrAdmin = ['teacher','school_admin','super_admin'].includes(user.role);
  const isStudent = user.role === 'student';

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        fetch(`${API}/courses/${id}`, { headers }).then(r => r.json()),
        fetch(`${API}/lessons/course/${id}`, { headers }).then(r => r.json()),
      ]);
      setCourse(courseRes.course);
      setLessons(lessonsRes.lessons || []);

      if (isStudent && user.id) {
        const progRes = await fetch(`${API}/progress/${user.id}/${id}`, { headers }).then(r => r.json());
        setProgress(progRes.progress || []);
        setCompletionPct(progRes.completion_percent || 0);
      }

      const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setBookmarked(saved.includes(Number(id)));
    } catch {}
    setLoading(false);
  };

  const markComplete = async (lessonId: number) => {
    try {
      await fetch(`${API}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: user.id, lesson_id: lessonId, course_id: Number(id), watch_percent: 100, completed: true, school_id: user.school_id }),
      });
      fetchData();
    } catch {}
  };

  const toggleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const courseId = Number(id);
    const updated = bookmarked ? saved.filter((x: number) => x !== courseId) : [...saved, courseId];
    localStorage.setItem('bookmarks', JSON.stringify(updated));
    setBookmarked(!bookmarked);
  };

  const togglePublish = async () => {
    try {
      await fetch(`${API}/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_published: !course?.is_published }),
      });
      setCourse(c => c ? { ...c, is_published: !c.is_published } : c);
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await fetch(`${API}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, course_id: Number(id), position: Number(form.position) }),
      });
      setShowForm(false);
      setForm({ title: '', content: '', video_url: '', position: String(lessons.length) });
      fetchData();
    } catch { setError('Failed to create lesson'); }
    setSaving(false);
  };

  const deleteLesson = async (lessonId: number) => {
    try {
      await fetch(`${API}/lessons/${lessonId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setDeleteId(null); fetchData();
    } catch {}
  };

  const isLessonCompleted = (lessonId: number) => progress.some(p => p.lesson_id === lessonId && p.completed);
  const lastCompleted = progress.filter(p => p.completed).sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())[0];
  const resumeLesson = lastCompleted ? lessons.find(l => l.id === lastCompleted.lesson_id) : null;
  const nextLesson = resumeLesson ? lessons.find(l => l.position > resumeLesson.position) || lessons[0] : lessons[0];
  const estimatedMinutes = lessons.length * 10;

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => router.back()}><ArrowLeft size={20} className="text-gray-500" /></button>
          <div className="flex items-center gap-2">
            <button onClick={toggleBookmark} className="p-2 rounded-lg bg-gray-50">
              {bookmarked ? <BookmarkCheck size={18} className="text-blue-600" /> : <Bookmark size={18} className="text-gray-400" />}
            </button>
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
        <h1 className="text-xl font-bold text-gray-900">{course?.title}</h1>
        {course?.description && <p className="text-sm text-gray-400 mt-1">{course.description}</p>}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-400"><BookOpen size={12} />{lessons.length} lessons</div>
          <div className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} />~{estimatedMinutes} min</div>
          {course?.teacher_name && <div className="flex items-center gap-1 text-xs text-gray-400"><Star size={12} />{course.teacher_name}</div>}
          <button onClick={() => router.push(`/dashboard/courses/${id}/reviews`)} className="flex items-center gap-1 text-xs text-blue-600 font-medium"><Star size={12} />Ratings and reviews</button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Progress bar — students only */}
        {isStudent && lessons.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">Your Progress</span>
              <span className="text-sm font-bold text-blue-600">{completionPct}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{progress.filter(p => p.completed).length} of {lessons.length} completed</span>
              {completionPct === 100 ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle size={11} />Completed!</span>
              ) : nextLesson ? (
                <button onClick={() => router.push(`/dashboard/lessons/${nextLesson.id}`)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                  <PlayCircle size={12} />{resumeLesson ? 'Resume' : 'Start'}
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteId && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">Delete this lesson?</p>
            <div className="flex gap-2">
              <button onClick={() => deleteLesson(deleteId)} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium">Delete</button>
              <button onClick={() => setDeleteId(null)} className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-xs">Cancel</button>
            </div>
          </div>
        )}

        {/* Add lesson form */}
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
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write lesson content here. The AI tutor uses this to answer student questions." rows={5} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
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

        {/* Course outline */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-900">Course Outline</h2>
            <span className="text-xs text-gray-400">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
          </div>
          {lessons.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{isTeacherOrAdmin ? 'No lessons yet. Tap + Add Lesson to start.' : 'No lessons available yet.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {lessons.map((l, i) => {
                const completed = isLessonCompleted(l.id);
                const isNext = nextLesson?.id === l.id;
                return (
                  <div key={l.id} className={`${isNext && isStudent ? 'bg-blue-50/50' : ''}`}>
                    <button className="w-full text-left px-4 py-4" onClick={() => router.push(`/dashboard/lessons/${l.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${completed ? 'bg-green-100 text-green-600' : isNext ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {completed ? <CheckCircle size={16} /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{l.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-gray-400">~10 min</span>
                            {l.video_url && <span className="flex items-center gap-1 text-xs text-blue-500"><Video size={10} />Video</span>}
                            {completed && <span className="text-xs text-green-600 font-medium">Completed</span>}
                            {isNext && isStudent && !completed && <span className="text-xs text-blue-600 font-medium">Up next</span>}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 shrink-0" />
                      </div>
                    </button>
                    {isStudent && !completed && (
                      <div className="px-4 pb-3 flex justify-end">
                        <button onClick={() => markComplete(l.id)} className="text-xs text-gray-400 hover:text-green-600 flex items-center gap-1">
                          <CheckCircle size={12} />Mark complete
                        </button>
                      </div>
                    )}
                    {isTeacherOrAdmin && (
                      <div className="px-4 pb-3 flex justify-end">
                        <button onClick={() => setDeleteId(l.id)} className="flex items-center gap-1 text-red-400 text-xs">
                          <Trash2 size={12} />Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Certificate banner */}
        {isStudent && completionPct === 100 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white text-center">
            <CheckCircle size={32} className="mx-auto mb-2" />
            <p className="font-bold text-lg">Course Complete!</p>
            <p className="text-blue-100 text-sm mb-3">You've completed all lessons in this course.</p>
            <button onClick={() => router.push('/dashboard/certificates')} className="bg-white text-blue-600 px-5 py-2 rounded-lg text-sm font-bold">View Certificate</button>
          </div>
        )}
      </div>
    </div>
  );
}
