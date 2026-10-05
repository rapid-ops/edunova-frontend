'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';
import VideoPlayer from '@/components/VideoPlayer';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [lRes, pRes] = await Promise.all([
        fetch(`${API}/api/lessons/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/progress/${user.id}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const lData = await lRes.json();
      setLesson(lData.lesson || lData);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProgress(pData.progress?.watch_percent || 0);
      }
    } finally { setLoading(false); }
  }

  async function saveProgress(pct: number) {
    if (!lesson) return;
    await fetch(`${API}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ lesson_id: id, course_id: lesson.course_id, watch_percent: pct }),
    });
  }

  async function markComplete() {
    if (!lesson) return;
    await fetch(`${API}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ lesson_id: id, course_id: lesson.course_id, watch_percent: 100, completed: true }),
    });
  }

  if (loading) return <LoadingScreen />;
  if (!lesson) return <div className="p-6 text-center text-gray-400">Lesson not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 text-sm mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-3">{lesson.title}</h1>

      {lesson.video_url && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <VideoPlayer
            url={lesson.video_url}
            lessonId={String(id)}
            initialProgress={progress}
            onProgressSave={saveProgress}
            onComplete={markComplete}
          />
        </div>
      )}

      {lesson.content && (
        <div className="bg-white rounded-xl border p-4 mb-4">
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
            <FileText size={16} /> Lesson Notes
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{lesson.content}</div>
        </div>
      )}

      {lesson.file_url && (
        <a href={lesson.file_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 text-sm underline">
          <FileText size={14} /> Download Attachment
        </a>
      )}
    </div>
  );
}
