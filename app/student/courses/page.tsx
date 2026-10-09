'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import GamificationWidget from '@/components/GamificationWidget';

export default function StudentCoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const er = await api.get(`/enrollments/student/${user.id}`);
        const list: any[] = er.data.enrollments || [];
        setEnrollments(list);
        const pmap: Record<number, number> = {};
        await Promise.all(list.map(async (e: any) => {
          try {
            const pr = await api.get(`/progress/${user.id}/${e.course_id}`);
            pmap[e.course_id] = pr.data.completion_percent ?? 0;
          } catch { pmap[e.course_id] = 0; }
        }));
        setProgress(pmap);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">My Courses</h1>
      {user && <div className="mb-6"><GamificationWidget studentId={user.id} /></div>}

      {!enrollments.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">You are not enrolled in any courses yet.</p>
          <button onClick={() => router.push('/student/browse')} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium">Browse Courses</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {enrollments.map((e: any) => {
            const pct = progress[e.course_id] ?? 0;
            return (
              <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-gray-900 text-sm leading-snug">{e.course_title}</h2>
                  <span className="shrink-0 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                    Lvl {Math.floor(pct / 20) + 1}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span><span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/student/course/${e.course_id}`)}
                  className="mt-auto flex items-center justify-center gap-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium"
                >
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
