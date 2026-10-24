'use client';
import { useEffect, useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Child, ChildData, attendanceStats, recentResults, scoreText } from '@/lib/parent-utils';

interface Row { child: Child; data: ChildData | null; }

export default function ParentChildrenPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [summary, setSummary] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<Record<number, boolean>>({});
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

  const askAi = async (child: Child) => {
    setBusy((p) => ({ ...p, [child.id]: true }));
    try {
      const r = await api.post('/ai/school-admin-query', { query: `Summarize progress for student ${child.full_name}`, student_id: child.id });
      const d = r.data || {};
      const text = [d.answer, d.response, d.reply, d.summary, d.result].find((x) => typeof x === 'string');
      setSummary((p) => ({ ...p, [child.id]: text || 'A summary was returned in a format this page cannot show yet.' }));
    } catch (e: any) {
      const code = e?.response?.status;
      setSummary((p) => ({ ...p, [child.id]: code === 403 || code === 404 ? 'AI summaries are not available for parent accounts yet.' : 'The AI summary could not be generated. Try again later.' }));
    } finally { setBusy((p) => ({ ...p, [child.id]: false })); }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">My Children</h1>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {!rows.length && !error ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">No linked children yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ child, data }) => {
            const isOpen = open === child.id;
            const att = attendanceStats(data?.attendance ?? null);
            return (
              <div key={child.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <button onClick={() => setOpen(isOpen ? null : child.id)} className="flex w-full items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {child.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{child.full_name}</p>
                      {child.email && <p className="text-xs text-gray-400">{child.email}</p>}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="space-y-4 border-t border-gray-100 p-4">
                    {!data ? <p className="text-sm text-gray-400">Details are unavailable right now.</p> : (
                      <>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Enrolled courses</p>
                          {data.enrollments.length ? data.enrollments.map((e) => (
                            <p key={e.id} className="text-sm text-gray-700">
                              {e.course_title}
                              {e.enrolled_at && <span className="text-xs text-gray-400"> · enrolled {new Date(e.enrolled_at).toLocaleDateString()}</span>}
                            </p>
                          )) : <p className="text-sm text-gray-400">None</p>}
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Recent scores</p>
                          {data.results.length ? recentResults(data.results, 5).map((g) => (
                            <div key={g.id} className="flex justify-between gap-2 text-sm text-gray-700">
                              <span className="truncate">{g.assessment_title}{g.type ? ` (${g.type})` : ''}</span>
                              <span className="shrink-0 font-medium">{scoreText(g)}</span>
                            </div>
                          )) : <p className="text-sm text-gray-400">No scores yet</p>}
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Attendance</p>
                          {att.total ? (
                            <p className="text-sm text-gray-700">{att.rate}% attended: {att.present} present, {att.late} late, {att.absent} absent</p>
                          ) : <p className="text-sm text-gray-400">No attendance records yet</p>}
                        </div>
                      </>
                    )}
                    {summary[child.id] ? (
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm whitespace-pre-wrap text-gray-700">{summary[child.id]}</div>
                    ) : (
                      <button onClick={() => askAi(child)} disabled={busy[child.id]} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                        <Brain size={15} />{busy[child.id] ? 'Generating...' : 'AI progress summary'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
