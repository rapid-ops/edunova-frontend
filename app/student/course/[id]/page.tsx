'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Circle, Lock, MessageSquare, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import LessonPlayer from '@/components/LessonPlayer';
import LessonDiscussion from '@/components/LessonDiscussion';

interface Lesson { id: number; title: string; content?: string | null; video_url?: string | null; locked?: boolean; unlocks_at?: string | null; }
interface Prog { lesson_id: number; watch_percent: number; completed: boolean; }
interface Toast { xp: number; level: number | null; }

export default function CourseViewPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<number, Prog>>({});
  const [coursePct, setCoursePct] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tab, setTab] = useState<'lesson' | 'discussion'>('lesson');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<Toast | null>(null);
  const [certificate, setCertificate] = useState(false);
  const level = useRef<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  useEffect(() => {
    if (!user || !courseId) return;
    let alive = true;
    (async () => {
      try {
        const [c, l, p, g] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/lessons/course/${courseId}`),
          api.get(`/progresss/${user.id}/${courseId}`),
          api.get(`/gamification/profile/${user.id}`).catch(() => null),
        ]);
        if (!alive) return;
        const list: Lesson[] = l.data.lessons || [];
        const map: Record<number, Prog> = {};
        (p.data.progress || []).forEach((row: Prog) => { map[Number(row.lesson_id)] = row; });
        setCourse(c.data.course || c.data);
        setLessons(list);
        setProgress(map);
        setCoursePct(p.data.completion_percent ?? 0);
        level.current = g?.data?.profile?.level ?? null;
        const resume = list.find((x) => !x.locked && !map[x.id]?.completed) || list.find((x) => !x.locked);
        setSelectedId(resume ? resume.id : null);
      } catch (e: any) {
        if (alive) setError(e?.response?.data?.error || 'Could not load this course');
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [user, courseId]);

  const saveProgress = useCallback(async (lessonId: number, pct: number, done: boolean) => {
    try {
      const r = await api.post('/progresss', { lesson_id: lessonId, course_id: courseId, watch_percent: pct, completed: done });
      setProgress((prev) => {
        const old = prev[lessonId];
        return { ...prev, [lessonId]: { lesson_id: lessonId, watch_percent: Math.max(pct, Number(old?.watch_percent) || 0), completed: done || !!old?.completed } };
      });
      if (typeof r.data.course_completion_percent === 'number') setCoursePct(r.data.course_completion_percent);
      if (r.data.certificate) setCertificate(true);
      const g = r.data.gamification;
      if (g) {
        const up = level.current !== null && g.level > level.current ? g.level : null;
        level.current = g.level;
        setToast({ xp: g.xp_awarded, level: up });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3500);
      }
    } catch { /* the next save retries */ }
  }, [courseId]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-400">Loading...</div>;
  if (error || !course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-red-500">{error || 'Course not found'}</p>
        <button onClick={() => router.push('/student/courses')} className="text-sm text-blue-600">Back to my courses</button>
      </div>
    );
  }

  const sel = lessons.find((x) => x.id === selectedId) || null;
  const selDone = sel ? !!progress[sel.id]?.completed : false;

  return (
    <div className="mx-auto max-w-5xl p-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
          >
            <span className="inline-flex items-center gap-2">
              <Zap size={16} />
              {toast.level ? `Level ${toast.level} reached! +${toast.xp} XP` : `+${toast.xp} XP`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => router.push('/student/courses')} className="mb-3 inline-flex items-center gap-1 text-xs text-blue-600">
        <ArrowLeft size={14} /> My courses
      </button>
      <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
      {course.teacher_name && <p className="text-xs text-gray-400">{course.teacher_name}</p>}
      <div className="my-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${coursePct}%` }} />
        </div>
        <span className="text-xs text-gray-500">{coursePct}%</span>
      </div>
      {certificate && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">Course complete. Your certificate has been issued.</p>}

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <aside className="order-2 space-y-1 rounded-xl border border-gray-200 bg-white p-3 lg:order-1">
          {lessons.map((l) => {
            const done = !!progress[l.id]?.completed;
            const active = l.id === selectedId;
            return (
              <button
                key={l.id}
                disabled={!!l.locked}
                onClick={() => { setSelectedId(l.id); setTab('lesson'); }}
                className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'} ${l.locked ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <span className="mt-0.5 shrink-0">
                  {l.locked ? <Lock size={14} className="text-gray-400" /> : done ? <Check size={14} className="text-green-600" /> : <Circle size={14} className="text-gray-300" />}
                </span>
                <span className="flex-1">
                  <span className="block leading-snug">{l.title}</span>
                  {l.locked && (
                    <span className="mt-0.5 block text-xs text-gray-400">
                      {l.unlocks_at ? `Unlocks on ${new Date(l.unlocks_at).toLocaleDateString()}` : 'Locked'}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
          {!lessons.length && <p className="p-3 text-sm text-gray-400">No lessons yet.</p>}
        </aside>

        <main className="order-1 min-w-0 lg:order-2">
          {!sel ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">No lessons available yet.</div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">{sel.title}</h2>
              {sel.video_url && (
                <LessonPlayer
                  key={sel.id}
                  src={sel.video_url}
                  initialPercent={Number(progress[sel.id]?.watch_percent) || 0}
                  completed={selDone}
                  onSave={(p, d) => saveProgress(sel.id, p, d)}
                />
              )}
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                <span className="text-sm text-gray-500">{selDone ? 'Lesson completed' : 'Watch to 90% or mark it complete'}</span>
                {selDone ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <button onClick={() => saveProgress(sel.id, 100, true)} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white">Mark complete</button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTab('lesson')} className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'lesson' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Lesson</button>
                <button onClick={() => setTab('discussion')} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${tab === 'discussion' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <MessageSquare size={13} /> Discussion
                </button>
              </div>
              {tab === 'lesson' ? (
                sel.content ? <p className="whitespace-pre-wrap text-sm text-gray-700">{sel.content}</p> : <p className="text-sm text-gray-400">No written content for this lesson.</p>
              ) : (
                <LessonDiscussion key={sel.id} lessonId={sel.id} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
