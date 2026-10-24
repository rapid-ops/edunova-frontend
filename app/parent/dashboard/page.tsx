'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CreditCard, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Child, ChildData, attendanceStats, outstanding, naira, recentResults, scoreText } from '@/lib/parent-utils';

interface Row { child: Child; data: ChildData | null; }

export default function ParentDashboard() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const r = await api.get(`/parents/children/${user.id}`);
        const kids: Child[] = r.data.children || [];
        const data = await Promise.all(
          kids.map((c) => api.get(`/parents/child/${c.id}`).then((x) => x.data as ChildData).catch(() => null))
        );
        if (alive) setRows(kids.map((child, i) => ({ child, data: data[i] })));
      } catch (e: any) {
        if (alive) setError(e?.response?.data?.error || 'Could not load your children');
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
      <p className="mb-5 text-sm text-gray-400">Your children at a glance</p>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {!rows.length && !error ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          No linked children yet. Ask the school administrator to link your account.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(({ child, data }) => {
            const att = attendanceStats(data?.attendance ?? null);
            const owing = outstanding(data?.fees || []);
            const owed = owing.reduce((s, f) => s + (Number(f.amount) || 0), 0);
            const grades = recentResults(data?.results || []);
            return (
              <div key={child.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {child.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900">{child.full_name}</h2>
                    {child.email && <p className="truncate text-xs text-gray-400">{child.email}</p>}
                  </div>
                </div>
                {!data ? (
                  <p className="text-sm text-gray-400">Details are unavailable right now.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <CalendarDays size={14} className="mb-1 text-blue-600" />
                      <p className="text-lg font-bold text-gray-900">{att.rate === null ? 'No records' : `${att.rate}%`}</p>
                      <p className="text-xs text-gray-500">Attendance{att.total ? ` (${att.absent} absent)` : ''}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <BookOpen size={14} className="mb-1 text-green-600" />
                      {grades.length ? grades.map((g) => (
                        <p key={g.id} className="truncate text-xs text-gray-700">{g.assessment_title}: <span className="font-semibold">{scoreText(g)}</span></p>
                      )) : <p className="text-sm text-gray-500">No grades yet</p>}
                      <p className="mt-1 text-xs text-gray-500">Recent grades</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3">
                      <CreditCard size={14} className="mb-1 text-red-500" />
                      <p className="text-lg font-bold text-gray-900">{owing.length ? naira(owed) : 'Nothing due'}</p>
                      <p className="text-xs text-gray-500">{owing.length} fee notice{owing.length === 1 ? '' : 's'} not marked paid</p>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/parent/fees" className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700">Pay fees</Link>
                  <Link href="/parent/children" className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700">Attendance and details</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
