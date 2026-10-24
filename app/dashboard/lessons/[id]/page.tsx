'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';
import VideoPlayer from '@/components/VideoPlayer';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [lesson, setLesson] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<{ retry: boolean; msg: string } | null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const l = await api.get(`/lessons/${id}`);
      const les = l.data.lesson;
      setLesson(les);
      if (user?.role === 'student') {
        try {
          const p = await api.get(`/progresss/${user.id}/${les.course_id}`);
          const row = (p.data.progress || []).find((r: any) => String(r.lesson_id) === String(id));
          setProgress(row?.watch_percent || 0);
        } catch {}
      }
    } catch (e: any) {
      const s = e?.response?.status;
      if (!e?.response) setErr({ retry: true, msg: 'Could not connect. Check your internet and try again.' });
      else if (s === 404) setErr({ retry: false, msg: 'Lesson not found' });
      else if (s === 403) setErr({ retry: false, msg: e.response.data?.error || 'You do not have access to this lesson' });
      else setErr({ retry: true, msg: 'Something went wrong. Please try again.' });
    } finally { setLoading(false); }
  }

  useEffect(() => { if (user) load(); }, [id, user?.id]);

  const save = (pct: number, done = false) => {
    if (!lesson || user?.role !== 'student') return Promise.resolve();
    return api.post('/progresss', { lesson_id: Number(id), course_id: lesson.course_id, watch_percent: pct, completed: done }).catch(() => {});
  };

  if (loading) return <LoadingScreen />;
  if (err) return (
    <div className="p-6 text-center">
      <p className="text-gray-500 mb-4">{err.msg}</p>
      {err.retry && <button onClick={load} className="bg-blue-600 text-white px-5 min-h-[44px] rounded-lg text-sm">Retry</button>}
      <button onClick={() => router.back()} className="block mx-auto mt-3 text-blue-600 text-sm min-h-[44px]">Go back</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 text-sm mb-4 min-h-[44px]">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-xl font-bold text-gray-800 mb-3 break-words">{lesson.title}</h1>
      {lesson.video_url && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <VideoPlayer url={lesson.video_url} lessonId={String(id)} initialProgress={progress}
            onProgressSave={(p: number) => save(p)} onComplete={() => save(100, true)} />
        </div>
      )}
      {lesson.content && (
        <div className="bg-white rounded-xl border p-4 mb-4">
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2"><FileText size={16} /> Lesson Notes</div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{lesson.content}</div>
        </div>
      )}
      {lesson.file_url && (
        <a href={lesson.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 text-sm underline min-h-[44px]">
          <FileText size={14} /> Open attachment
        </a>
      )}
    </div>
  );
}
