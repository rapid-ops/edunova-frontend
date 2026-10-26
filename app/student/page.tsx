'use client';
import Link from 'next/link';
import { BookOpen, ClipboardList, ClipboardCheck, TrendingUp, Bot, Trophy, Award } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { useAuthStore } from '@/store/auth.store';
import { Card, EmptyBlock, PageError, PageSkeleton, Bar, usePortalData, greeting, firstName, fmtDate, dueLabel, pctTone } from '@/components/portal/blocks';

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: d, loading, err, reload } = usePortalData(user ? '/portal/student/' + user.id : null);

  if (err) return <PageError err={err} onRetry={reload} />;
  if (loading || !d) return <PageSkeleton />;

  const courses: any[] = d.courses || [];
  const upcoming: any[] = d.upcoming || [];
  const grades: any[] = d.grades || [];
  const badges: any[] = d.badges || [];
  const xp = d.xp || { level: 1, total_xp: 0, streak_days: 0 };
  const stats = d.stats || {};

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white shadow-sm">
        <h1 className="break-words text-xl font-bold sm:text-2xl">{greeting()}, {firstName(d.profile?.full_name || user?.full_name)}!</h1>
        <p className="mt-1 text-sm text-blue-50">Here is how your learning is going.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/20 px-3 py-1.5">Level {xp.level}</span>
          <span className="rounded-full bg-white/20 px-3 py-1.5">{xp.total_xp} points</span>
          <span className="rounded-full bg-white/20 px-3 py-1.5">{xp.streak_days} day streak</span>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Courses" value={stats.courses ?? 0} icon={BookOpen} tone="blue" hint="You are enrolled in" />
        <StatCard label="Assignments" value={stats.assignments_due_week ?? 0} icon={ClipboardList} tone="purple" hint="Due in the next 7 days" />
        <StatCard label="Quizzes" value={stats.quizzes_upcoming ?? 0} icon={ClipboardCheck} tone="green" hint="Coming up" />
        <StatCard label="Overall progress" value={stats.overall_progress === null || stats.overall_progress === undefined ? '--' : stats.overall_progress + '%'} icon={TrendingUp} tone="orange" hint={stats.overall_progress === null || stats.overall_progress === undefined ? 'Starts when you finish a lesson' : 'Across your courses'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="My Courses" href="/student/courses" className="lg:col-span-2">
          {courses.length === 0 ? (
            <EmptyBlock text="You are not enrolled in any course yet. Your school will enrol you in your courses, or you can ask your teacher." href="/student/courses" cta="See my courses" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {courses.map((c) => (
                <li key={c.id}>
                  <Link href={'/student/course/' + c.id} className="block min-h-11 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-semibold text-slate-800">{c.title}</p>
                      <span className="shrink-0 text-xs font-semibold text-blue-600">{c.percent}%</span>
                    </div>
                    <div className="mt-2"><Bar value={c.percent} /></div>
                    <p className="mt-1 text-xs text-slate-500">{c.total_lessons === 0 ? 'No lessons added yet' : c.completed_lessons + ' of ' + c.total_lessons + ' lessons done'}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Ask the AI Tutor">
          <p className="text-sm text-slate-600">Stuck on a topic? Ask the tutor to explain it in simple words.</p>
          <Link href={d.links?.ai_tutor || '/student/ai-tutor'} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><Bot className="h-4 w-4" /> Open the AI Tutor</Link>
          <Link href="/student/leaderboard" className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 text-sm font-semibold text-blue-600 hover:bg-blue-50"><Trophy className="h-4 w-4" /> See the leaderboard</Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Assignments and quizzes coming up" href="/student/assignments" className="lg:col-span-2">
          {upcoming.length === 0 ? (
            <EmptyBlock text="Assignments and quizzes with a due date will show here. Nothing is due right now." href="/student/assignments" cta="Open assignments" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((a) => {
                const due = dueLabel(a.due_date);
                return (
                  <li key={a.type + a.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{a.title}</p>
                      <p className="truncate text-xs text-slate-500">{a.course_title} · {a.type === 'quiz' ? 'Quiz' : 'Assignment'} · {fmtDate(a.due_date)}</p>
                    </div>
                    {a.submitted ? <StatusBadge tone="green">Submitted</StatusBadge> : <StatusBadge tone={due.tone}>{due.text}</StatusBadge>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Recent grades" href="/student/results">
          {grades.length === 0 ? (
            <EmptyBlock text="Your marks will appear here after a teacher grades your work." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {grades.map((g) => (
                <li key={g.assessment_id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{g.assessment_title}</p>
                    <p className="truncate text-xs text-slate-500">{g.course_title} · {g.score} out of {g.total_marks}</p>
                  </div>
                  <StatusBadge tone={pctTone(g.percent)}>{g.percent === null ? '--' : g.percent + '%'}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {badges.length > 0 && (
        <Card title="Achievements" href="/student/leaderboard" linkLabel="Leaderboard">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((b) => (
              <li key={b.id} className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-500"><Award className="h-5 w-5" /></span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{b.name}</p>{b.description && <p className="line-clamp-2 text-xs text-slate-500">{b.description}</p>}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
