'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, Star, Wallet, CalendarDays, MessageSquare } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import Avatar from '@/components/admin/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { Card, EmptyBlock, PageError, PageSkeleton, Bar, usePortalData, greeting, firstName, fmtDate, naira, dueLabel, pctTone } from '@/components/portal/blocks';

const MARK: Record<string, { label: string; dot: string; tone: 'green' | 'orange' | 'red' }> = {
  present: { label: 'Present', dot: 'bg-green-500', tone: 'green' },
  late: { label: 'Late', dot: 'bg-orange-400', tone: 'orange' },
  absent: { label: 'Absent', dot: 'bg-red-500', tone: 'red' },
};

export default function ParentDashboard() {
  const user = useAuthStore((s) => s.user);
  const [child, setChild] = useState<number | null>(null);
  const path = user ? '/portal/parent/' + user.id + (child ? '?child=' + child : '') : null;
  const { data: d, loading, err, reload } = usePortalData(path);

  if (err) return <PageError err={err} onRetry={reload} />;
  if (!d) return <PageSkeleton />;

  const kids: any[] = d.children || [];
  const sel = d.selected_child;
  const c = d.child;
  const notices: any[] = d.announcements || [];

  return (
    <div className={'mx-auto max-w-7xl space-y-4 p-4 lg:p-6 ' + (loading ? 'opacity-60' : '')}>
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-sky-100 p-5 shadow-sm">
        <h1 className="break-words text-xl font-bold text-[#0b1a4a] sm:text-2xl">Welcome back, {firstName(d.parent?.full_name || user?.full_name)}!</h1>
        <p className="mt-1 text-sm text-slate-600">Stay informed and support your child&apos;s success.</p>
      </section>

      {kids.length === 0 ? (
        <Card title="Your children">
          <EmptyBlock text="No child is linked to your account yet. Please ask the school office to link your child to your account." />
        </Card>
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Choose a child">
            {kids.map((k) => {
              const on = sel && Number(sel.id) === Number(k.id);
              return (
                <button key={k.id} type="button" role="tab" aria-selected={!!on} onClick={() => setChild(k.id)}
                  className={'flex min-h-14 shrink-0 items-center gap-3 rounded-2xl border bg-white px-4 text-left shadow-sm ' + (on ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100')}>
                  <Avatar name={k.full_name} src={k.avatar_url} size={40} />
                  <span className="max-w-[160px] truncate text-sm font-semibold text-slate-800">{k.full_name}</span>
                </button>
              );
            })}
          </div>

          {c && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Attendance" value={c.attendance.rate === null ? '--' : c.attendance.rate + '%'} icon={Eye} tone="green" hint={c.attendance.rate === null ? 'No records yet' : 'Last 30 days'} />
                <StatCard label="Average grade" value={c.grades.average_percent === null ? '--' : c.grades.average_percent + '%'} icon={Star} tone="purple" hint={c.grades.average_percent === null ? 'No marks yet' : 'All graded work'} />
                <StatCard label="Outstanding fees" value={naira(c.fees.outstanding_total)} icon={Wallet} tone="red" hint={c.fees.outstanding_count === 0 ? 'Nothing to pay' : c.fees.outstanding_count + ' unpaid'} />
                <StatCard label="Coming up" value={c.upcoming.length} icon={CalendarDays} tone="blue" hint="Assignments and quizzes" />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Attendance this week" className="lg:col-span-2">
                  <ul className="grid grid-cols-5 gap-2">
                    {c.attendance.week.map((w: any) => {
                      const m = w.status ? MARK[String(w.status).toLowerCase()] : null;
                      return (
                        <li key={w.date} className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 p-2 text-center">
                          <span className="text-xs font-semibold text-slate-600">{w.day}</span>
                          <span className={'h-3 w-3 rounded-full ' + (m ? m.dot : 'bg-slate-300')} aria-hidden="true" />
                          <span className="text-[11px] text-slate-500">{m ? m.label : 'No record'}</span>
                        </li>
                      );
                    })}
                  </ul>
                  {c.attendance.week.every((w: any) => !w.status) && <p className="mt-3 text-xs text-slate-500">Attendance will show here once the teacher takes the register.</p>}
                </Card>

                <Card title="Fees and payments" href="/parent/fees" linkLabel="Open fees">
                  {c.fees.outstanding_count === 0 ? (
                    <EmptyBlock text="There are no unpaid fees right now." />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-red-600">{naira(c.fees.outstanding_total)}</p>
                      <p className="text-xs text-slate-500">{c.fees.outstanding_count} unpaid {c.fees.outstanding_count === 1 ? 'fee' : 'fees'}</p>
                      <ul className="mt-2 divide-y divide-slate-100">
                        {c.fees.items.map((f: any) => (
                          <li key={f.id} className="flex items-center justify-between gap-2 py-2 text-sm"><span className="min-w-0 truncate text-slate-700">{f.description || 'School fee'}</span><span className="shrink-0 font-semibold text-slate-800">{naira(f.amount)}</span></li>
                        ))}
                      </ul>
                      <Link href={d.links?.fees || '/parent/fees'} className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">View fees and pay</Link>
                    </>
                  )}
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Recent grades">
                  {c.grades.recent.length === 0 ? (
                    <EmptyBlock text="Marks will appear here after teachers grade your child's work." />
                  ) : (
                    <ul className="space-y-3">
                      {c.grades.recent.map((g: any) => (
                        <li key={g.assessment_id}>
                          <div className="flex items-center justify-between gap-2"><p className="min-w-0 truncate text-sm font-semibold text-slate-800">{g.assessment_title}</p><StatusBadge tone={pctTone(g.percent)}>{g.percent === null ? '--' : g.percent + '%'}</StatusBadge></div>
                          <p className="mb-1 truncate text-xs text-slate-500">{g.course_title}</p>
                          <Bar value={g.percent} color={g.percent !== null && g.percent >= 70 ? 'bg-green-500' : g.percent !== null && g.percent >= 50 ? 'bg-orange-400' : 'bg-red-500'} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card title="Upcoming assessments">
                  {c.upcoming.length === 0 ? (
                    <EmptyBlock text="Upcoming assignments and quizzes with a due date will show here." />
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {c.upcoming.map((a: any) => { const due = dueLabel(a.due_date); return (
                        <li key={a.type + a.id} className="flex items-center justify-between gap-3 py-3">
                          <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{a.title}</p><p className="truncate text-xs text-slate-500">{a.course_title} · {fmtDate(a.due_date)}</p></div>
                          <StatusBadge tone={due.tone}>{due.text}</StatusBadge>
                        </li>
                      ); })}
                    </ul>
                  )}
                </Card>

                <Card title="Recent assignments">
                  {c.recent_assignments.length === 0 ? (
                    <EmptyBlock text="Assignments given to your child will show here." />
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {c.recent_assignments.map((a: any) => (
                        <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                          <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{a.title}</p><p className="truncate text-xs text-slate-500">{a.course_title}{a.due_date ? ' · due ' + fmtDate(a.due_date) : ''}</p></div>
                          <StatusBadge tone={a.submitted ? 'green' : 'orange'}>{a.submitted ? 'Submitted' : 'Pending'}</StatusBadge>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>
            </>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="School notices" href="/dashboard/announcements" className="lg:col-span-2">
              {notices.length === 0 ? (
                <EmptyBlock text="Notices from the school will show here." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notices.map((n) => (
                    <li key={n.id} className="py-3"><p className="text-sm font-semibold text-slate-800">{n.title}</p>{n.body && <p className="line-clamp-2 text-xs text-slate-600">{n.body}</p>}<p className="mt-1 text-[11px] text-slate-400">{fmtDate(n.created_at)}{n.author_name ? ' · ' + n.author_name : ''}</p></li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Messages">
              <p className="text-sm text-slate-600">Send a message to your child&apos;s teachers or read their replies.</p>
              <Link href={d.links?.messages || '/dashboard/messages'} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><MessageSquare className="h-4 w-4" /> Open messages</Link>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
