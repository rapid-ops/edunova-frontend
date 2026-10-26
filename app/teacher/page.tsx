'use client';
import Link from 'next/link';
import { Users, ClipboardCheck, CalendarDays, Eye, BookOpen, Bot, ClipboardList, PenSquare } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import DonutChart from '@/components/admin/DonutChart';
import { useAuthStore } from '@/store/auth.store';
import { Card, EmptyBlock, PageError, PageSkeleton, Bar, usePortalData, greeting, firstName, fmtDate, hhmm, pctTone } from '@/components/portal/blocks';

const STATE: Record<string, { label: string; tone: 'green' | 'blue' | 'gray' }> = {
  now: { label: 'In progress', tone: 'green' },
  next: { label: 'Upcoming', tone: 'blue' },
  done: { label: 'Finished', tone: 'gray' },
};

export default function TeacherDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: d, loading, err, reload } = usePortalData(user ? '/portal/teacher/' + user.id : null);

  if (err) return <PageError err={err} onRetry={reload} />;
  if (loading || !d) return <PageSkeleton />;

  const s = d.stats || {};
  const courses: any[] = d.courses || [];
  const classes: any[] = d.classes || [];
  const today: any[] = d.today || [];
  const recent: any[] = d.recent_submissions || [];
  const dist = d.distribution || { excellent: 0, good: 0, average: 0, poor: 0 };
  const total = dist.excellent + dist.good + dist.average + dist.poor;
  const avgs = courses.filter((c) => c.average_percent !== null).map((c) => Number(c.average_percent));
  const overall = avgs.length ? Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10 : null;

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-sky-100 p-5 shadow-sm">
        <h1 className="break-words text-xl font-bold text-[#0b1a4a] sm:text-2xl">{greeting()}, {firstName(d.teacher?.full_name || user?.full_name)}!</h1>
        <p className="mt-1 text-sm text-slate-600">Here is your teaching overview for today.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/teacher/assessments" className="flex min-h-11 items-center gap-2 rounded-full border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"><PenSquare className="h-4 w-4" /> Create an assessment</Link>
          <Link href="/teacher/attendance" className="flex min-h-11 items-center gap-2 rounded-full border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"><ClipboardList className="h-4 w-4" /> Take attendance</Link>
          <Link href={d.links?.ai_tools || '/teacher/ai-tools'} className="flex min-h-11 items-center gap-2 rounded-full border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Bot className="h-4 w-4" /> AI tools</Link>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="My classes" value={s.classes ?? 0} icon={BookOpen} tone="blue" hint="From your timetable" />
        <StatCard label="My students" value={s.students ?? 0} icon={Users} tone="purple" hint="Across your courses" />
        <StatCard label="To be graded" value={s.pending_grading ?? 0} icon={ClipboardCheck} tone="orange" hint="Submissions waiting" />
        <StatCard label="Lessons today" value={s.lessons_today ?? 0} icon={CalendarDays} tone="blue" hint="On your timetable" />
        <StatCard label="Attendance" value={s.attendance_rate === null || s.attendance_rate === undefined ? '--' : s.attendance_rate + '%'} icon={Eye} tone="green" hint={s.attendance_rate === null || s.attendance_rate === undefined ? 'No records this week' : 'Last 7 days'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Today's schedule" href="/teacher/timetable" linkLabel="Full timetable">
          {today.length === 0 ? (
            <EmptyBlock text="You have no lessons on your timetable today. The school office adds lessons to the timetable." href="/teacher/timetable" cta="Open timetable" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {today.map((t) => { const m = STATE[t.state] || STATE.next; return (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="text-xs font-semibold text-slate-500">{hhmm(t.start_time)} - {hhmm(t.end_time)}</p><p className="truncate text-sm font-semibold text-slate-800">{t.course_title}</p><p className="truncate text-xs text-slate-500">{t.class_name}</p></div>
                  <StatusBadge tone={m.tone}>{m.label}</StatusBadge>
                </li>
              ); })}
            </ul>
          )}
        </Card>

        <Card title="Class performance" href="/teacher/analytics" linkLabel="Details">
          {total === 0 ? (
            <EmptyBlock text="Class results will show here after you grade your first submissions." href="/teacher/assessments" cta="Go to assessments" />
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <DonutChart size={140} thickness={18} centerLabel={overall === null ? '--' : overall + '%'} centerSub="Average"
                segments={[{ label: 'Excellent', value: dist.excellent, color: '#22c55e' }, { label: 'Good', value: dist.good, color: '#3b82f6' }, { label: 'Average', value: dist.average, color: '#f59e0b' }, { label: 'Poor', value: dist.poor, color: '#ef4444' }]} />
              <ul className="w-full space-y-1.5 text-sm">
                <li className="flex justify-between"><span className="text-slate-600">Excellent (80% and above)</span><b>{dist.excellent}</b></li>
                <li className="flex justify-between"><span className="text-slate-600">Good (60% to 79%)</span><b>{dist.good}</b></li>
                <li className="flex justify-between"><span className="text-slate-600">Average (40% to 59%)</span><b>{dist.average}</b></li>
                <li className="flex justify-between"><span className="text-slate-600">Poor (below 40%)</span><b>{dist.poor}</b></li>
              </ul>
            </div>
          )}
        </Card>

        <Card title="Waiting to be graded" href={d.links?.grading || '/teacher/assessments'} linkLabel="Grade now">
          <p className="text-3xl font-bold text-orange-500">{s.pending_grading ?? 0}</p>
          <p className="mb-2 text-xs text-slate-500">submissions need your marks</p>
          {recent.length === 0 ? (
            <EmptyBlock text="Student submissions will show here as they come in." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{r.student_name}</p><p className="truncate text-xs text-slate-500">{r.assessment_title} · {fmtDate(r.submitted_at)}</p></div>
                  <StatusBadge tone={r.status === 'graded' ? 'green' : 'orange'}>{r.status === 'graded' ? 'Graded' : 'To grade'}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="My courses and class averages" href="/teacher/analytics" linkLabel="Analytics">
          {courses.length === 0 ? (
            <EmptyBlock text="Courses assigned to you will show here. Ask the school office to assign your courses." />
          ) : (
            <ul className="space-y-3">
              {courses.map((c) => (
                <li key={c.id}>
                  <div className="flex items-center justify-between gap-2"><p className="min-w-0 truncate text-sm font-semibold text-slate-800">{c.title}</p><StatusBadge tone={pctTone(c.average_percent)}>{c.average_percent === null ? 'No marks yet' : c.average_percent + '%'}</StatusBadge></div>
                  <p className="mb-1 text-xs text-slate-500">{c.students} {c.students === 1 ? 'student' : 'students'}{c.pending > 0 ? ' · ' + c.pending + ' to grade' : ''}</p>
                  <Bar value={c.average_percent} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="My classes" href="/teacher/timetable" linkLabel="Timetable">
          {classes.length === 0 ? (
            <EmptyBlock text="The classes you teach appear here once the school office puts you on the timetable." />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {classes.map((c) => (
                <li key={c.id} className="rounded-xl bg-blue-50/60 p-3"><p className="truncate text-sm font-semibold text-slate-800">{c.name}</p><p className="text-xs text-slate-500">{c.lessons_per_week} {c.lessons_per_week === 1 ? 'lesson' : 'lessons'} a week</p></li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
