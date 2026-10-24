'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import GamificationWidget from '@/components/GamificationWidget';

interface Enrollment { id: number; course_id: number; course_title: string; teacher_name?: string | null; }

const status = (p: number) => (p >= 100 ? 'Completed' : p > 0 ? 'In progress' : 'Not started');

export default function StudentCoursesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<Enrollment[]>([]);
  const [pct, setPct] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const er = await api.get(`/enrollments/student/${user.id}`);
        const list: Enrollment[] = er.data.enrollments || [];
        const vals = await Promise.all(
          list.map((e) => api.get(`/progresss/${user.id}/${e.course_id}`).then((r) => Number(r.data.completion_percent) || 0).catch(() => 0))
        );
        if (!alive) return;
        const map: Record<number, number> = {};
        list.forEach((e, i) => { map[e.course_id] = vals[i]; });
        setItems(list);
        setPct(map);
      } catch { /* empty state shows */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">My Courses</h1>
      {user && <div className="mb-6"><GamificationWidget studentId={user.id} /></div>}
      {!items.length ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="mb-4 text-gray-500">You are not enrolled in any courses yet.</p>
          <button onClick={() => router.push('/student')} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white">Browse courses</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((e) => {
            const p = pct[e.course_id] ?? 0;
            return (
              <div key={e.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold leading-snug text-gray-900">{e.course_title}</h2>
                    {e.teacher_name && <p className="mt-0.5 text-xs text-gray-400">{e.teacher_name}</p>}
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{status(p)}</span>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-gray-400"><span>Progress</span><span>{p}%</span></div>
                  <div className="h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${p}%` }} /></div>
                </div>
                <button onClick={() => router.push(`/student/course/${e.course_id}`)} className="mt-auto flex items-center justify-center gap-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white">
                  Continue Learning <ChevronRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
