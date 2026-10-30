'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

// Number of submitted assignments that still need a grade (teachers and school admins).
export function useUngraded(): number {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const staff = user?.role === 'teacher' || user?.role === 'school_admin';

  const load = useCallback(async () => {
    if (!staff) return;
    try {
      const r = await api.get('/assessments/school-stats');
      const list: any[] = r.data.assessments || [];
      setCount(list.filter((x) => x.type !== 'quiz')
        .reduce((s, x) => s + Math.max(0, (Number(x.submission_count) || 0) - (Number(x.graded_count) || 0)), 0));
    } catch {}
  }, [staff]);

  useEffect(() => { load(); }, [load, pathname]);
  useEffect(() => {
    if (!staff) return;
    const iv = setInterval(load, 90000);
    window.addEventListener('grading-changed', load);
    return () => { clearInterval(iv); window.removeEventListener('grading-changed', load); };
  }, [staff, load]);

  return count;
}

export function UngradedPill() {
  const n = useUngraded();
  if (!n) return null;
  return <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">{n > 99 ? '99+' : n}</span>;
}

export function UngradedDot() {
  const n = useUngraded();
  if (!n) return null;
  return <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />;
}
