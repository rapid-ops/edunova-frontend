'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { GraduationCap, School, BookOpen, Users, UserCog, UserCheck, ChevronRight, ClipboardList, Calendar, DollarSign, BarChart2, Trophy, ScrollText, Zap, TrendingDown, Tag, Headphones, Palette, Megaphone } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';
import Skeleton from '@/components/admin/Skeleton';
import Avatar from '@/components/admin/Avatar';
import StatusBadge from '@/components/admin/StatusBadge';
import { LineChart, BarChart, DonutChart, ProgressRing } from '@/components/admin/charts';

interface Data {
  totals: { students: number; teachers: number; parents: number; classes: number; courses: number; published_courses: number; pending_approvals: number; enrollments: number } | null;
  attendance_today: { present: number; absent: number; late: number; total: number; rate: number | null } | null;
  attendance_trend: { date: string; present: number; total: number }[] | null;
  fees: { total_due: number; collected: number; outstanding: number; overdue_amount: number; invoices: number; paid_count: number; unpaid_count: number } | null;
  fees_monthly: { month: string; amount: number }[] | null;
  announcements: { id: number; title: string; created_at: string }[] | null;
  upcoming_assessments: { id: number; title: string; type: string; due_date: string; course_title: string }[] | null;
  upcoming_events: { id: number; title: string; type: string; start_date: string; end_date: string }[] | null;
  recent_registrations: { id: number; full_name: string; role: string; created_at: string }[] | null;
  top_courses: { id: number; title: string; enrolled: number }[] | null;
}

const naira = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) => new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium' }).format(new Date(s));
const fmtDateTime = (s: string) => new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(s));
const fmtPlain = (s: string) => new Intl.DateTimeFormat('en-NG', { timeZone: 'UTC', dateStyle: 'medium' }).format(new Date(s + 'T12:00:00Z'));
const fmtDay = (s: string) => new Intl.DateTimeFormat('en-NG', { timeZone: 'UTC', weekday: 'short' }).format(new Date(s + 'T12:00:00Z'));
const fmtMonth = (m: string) => new Intl.DateTimeFormat('en-NG', { timeZone: 'UTC', month: 'short' }).format(new Date(m + '-15T12:00:00Z'));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-50 px-4 py-3">
        <h2 className="text-sm font-bold text-[#0b1a4a]">{title}</h2>{action}
      </div>
      {children}
    </section>
  );
}

function Body({ loading, bad, empty, onRetry, children }: { loading: boolean; bad: boolean; empty?: React.ReactNode; onRetry: () => void; children: React.ReactNode }) {
  if (loading) return <div className="space-y-3 p-4"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></div>;
  if (bad) return <ErrorState message="Could not load this section." onRetry={onRetry} />;
  if (empty) return <>{empty}</>;
  return <>{children}</>;
}

const linkCls = 'inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-blue-600 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded';

const TOOLS = [
  { icon: Users, label: 'Students', href: '/school-admin/students' },
  { icon: UserCog, label: 'Course Assign', href: '/dashboard/course-assignments' },
  { icon: DollarSign, label: 'Fees', href: '/school-admin/fees' },
  { icon: ClipboardList, label: 'Attendance', href: '/dashboard/attendance' },
  { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Calendar, label: 'Timetable', href: '/dashboard/timetable' },
  { icon: Trophy, label: 'Gradebook', href: '/dashboard/gradebook' },
  { icon: ScrollText, label: 'Transcripts', href: '/dashboard/transcripts' },
  { icon: Zap, label: 'Automations', href: '/dashboard/automations' },
  { icon: TrendingDown, label: 'Dropout Risk', href: '/dashboard/dropout-risk' },
  { icon: Tag, label: 'Coupons', href: '/dashboard/coupons' },
  { icon: Headphones, label: 'Contact Support', href: '/dashboard/b2b-support' },
  { icon: Palette, label: 'Website Builder', href: '/dashboard/website' },
  { icon: Palette, label: 'Applications', href: '/dashboard/applications' },
  { icon: UserCheck, label: 'Approvals', href: '/school-admin/approvals' },
  { icon: Users, label: 'Parents', href: '/school-admin/parents' },
];

export default function SchoolAdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.school_id;
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true); setFailed(null);
    try {
      const r = await api.get(`/dashboard/school/${schoolId}`);
      setData(r.data);
    } catch (e: any) {
      setFailed(e?.response?.status === 403 ? 'You do not have access to this dashboard.' : e?.response?.status === 429 ? 'Too many requests, please try again shortly' : 'Could not load the dashboard.');
    } finally { setLoading(false); }
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  const first = (user?.full_name || '').trim().split(/\s+/)[0];
  const lagosHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
  const part = lagosHour < 12 ? 'Good morning' : lagosHour < 17 ? 'Good afternoon' : 'Good evening';
  const todayText = new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const schoolName = (data as any)?.school_name as string | undefined;
  const header = <PageHeader title={first ? `${part}, ${first}` : part} subtitle={`${schoolName ? schoolName + ' - ' : ''}${todayText}`} />;

  if (user && !schoolId) {
    return <>{header}<div className="px-4 lg:px-6"><EmptyState title="No school selected" message="This account is not linked to a school, so there is no school dashboard to show." /></div></>;
  }
  if (failed) return <>{header}<div className="px-4 lg:px-6"><ErrorState message={failed} onRetry={load} /></div></>;

  const L = loading || !data;
  const d = data;
  const t = d?.totals;
  const att = d?.attendance_today;
  const trend = d?.attendance_trend;
  const fees = d?.fees;
  const monthly = d?.fees_monthly;
  const pct = fees && fees.total_due > 0 ? Math.round((fees.collected / fees.total_due) * 100) : 0;
  const bad = (v: unknown) => !L && v === null;

  return (
    <div className="pb-6">
      {header}
      <div className="space-y-4 px-4 pt-3 lg:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Students" value={t?.students ?? 0} icon={GraduationCap} tone="blue" loading={L} hint={t ? `${t.parents} ${t.parents === 1 ? 'parent' : 'parents'}` : undefined} />
          <StatCard label="Teachers" value={t?.teachers ?? 0} icon={UserCog} tone="purple" loading={L} />
          <StatCard label="Classes" value={t?.classes ?? 0} icon={School} tone="orange" loading={L} />
          <StatCard label="Courses" value={t?.courses ?? 0} icon={BookOpen} tone="green" loading={L} hint={t ? `${t.published_courses} published` : undefined} />
        </div>
        {bad(t) && <ErrorState message="Could not load school totals." onRetry={load} />}

        {t && t.pending_approvals > 0 && (
          <Link href="/school-admin/approvals" className="flex min-h-11 items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <UserCheck className="h-5 w-5 text-emerald-600" />
            <span className="flex-1 text-sm font-semibold text-emerald-800">{t.pending_approvals} account{t.pending_approvals === 1 ? '' : 's'} waiting for approval</span>
            <ChevronRight className="h-4 w-4 text-emerald-600" />
          </Link>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Attendance today">
            <Body loading={L} bad={bad(att)} onRetry={load} empty={att && att.total === 0 ? <EmptyState icon={ClipboardList} title="No attendance recorded today" message="Attendance marked by teachers will show here." /> : null}>
              {att && (
                <div className="flex items-center gap-5 p-4">
                  <ProgressRing value={att.rate ?? 0} size={88} />
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-600"><span className="font-bold text-[#0b1a4a]">{att.present}</span> present</p>
                    <p className="text-slate-600"><span className="font-bold text-[#0b1a4a]">{att.late}</span> late</p>
                    <p className="text-slate-600"><span className="font-bold text-[#0b1a4a]">{att.absent}</span> absent</p>
                  </div>
                </div>
              )}
            </Body>
          </Card>
          <div className="lg:col-span-2">
            <Card title="Attendance, last 7 days" action={<Link href="/dashboard/attendance" className={linkCls}>Open</Link>}>
              <Body loading={L} bad={bad(trend)} onRetry={load} empty={trend && trend.length === 0 ? <p className="px-4 py-10 text-center text-sm text-slate-500">No attendance recorded in the last 7 days.</p> : null}>
                {trend && <div className="p-4"><LineChart labels={trend.map((x) => fmtDay(x.date))} series={[{ name: 'Present rate', color: '#2563eb', values: trend.map((x) => (x.total ? Math.round((x.present / x.total) * 100) : null)) }]} /></div>}
              </Body>
            </Card>
          </div>
        </div>

        <Card title="Fees overview" action={<Link href="/school-admin/fees" className={linkCls}>Open fees <ChevronRight className="h-3.5 w-3.5" /></Link>}>
          <Body loading={L} bad={bad(fees)} onRetry={load} empty={fees && fees.invoices === 0 ? <EmptyState icon={DollarSign} title="No invoices yet" message="Fees you create for students will be summarised here." /> : null}>
            {fees && (
              <div className="grid gap-4 p-4 lg:grid-cols-3">
                <div className="flex items-center gap-4">
                  <DonutChart size={120} thickness={14} centerLabel={`${pct}%`} centerSub="collected" segments={[{ label: 'Collected', value: fees.collected, color: '#10b981' }, { label: 'Outstanding', value: fees.outstanding, color: '#f59e0b' }]} />
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Collected</span><br /><span className="font-bold text-emerald-600">{naira(fees.collected)}</span></p>
                    <p><span className="text-slate-500">Outstanding</span><br /><span className="font-bold text-amber-600">{naira(fees.outstanding)}</span></p>
                    <p><span className="text-slate-500">Total due</span><br /><span className="font-bold text-[#0b1a4a]">{naira(fees.total_due)}</span></p>
                    {fees.overdue_amount > 0 && <p className="text-xs text-red-600">{naira(fees.overdue_amount)} overdue</p>}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <p className="mb-1 text-xs font-medium text-slate-500">Collected per month</p>
                  {monthly && monthly.length > 0
                    ? <BarChart height={180} labels={monthly.map((m) => fmtMonth(m.month))} series={[{ name: 'Collected', color: '#2563eb', values: monthly.map((m) => m.amount) }]} format={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)))} />
                    : <p className="py-8 text-center text-sm text-slate-500">No payments received in the last 6 months.</p>}
                </div>
              </div>
            )}
          </Body>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Upcoming assessments" action={<Link href="/school-admin/assessments" className={linkCls}>View all</Link>}>
            <Body loading={L} bad={bad(d?.upcoming_assessments)} onRetry={load} empty={d?.upcoming_assessments && d.upcoming_assessments.length === 0 ? <EmptyState icon={ClipboardList} title="Nothing due soon" message="Assessments with a future due date appear here." /> : null}>
              {d?.upcoming_assessments?.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 border-b border-slate-50 px-4 py-3 last:border-0">
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-[#0b1a4a]">{a.title}</p><p className="truncate text-xs text-slate-500">{a.course_title} - {fmtDateTime(a.due_date)}</p></div>
                  <StatusBadge tone="blue">{cap(a.type)}</StatusBadge>
                </div>
              ))}
            </Body>
          </Card>
          <Card title="Upcoming events" action={<Link href="/school-admin/calendar" className={linkCls}>Calendar</Link>}>
            <Body loading={L} bad={bad(d?.upcoming_events)} onRetry={load} empty={d?.upcoming_events && d.upcoming_events.length === 0 ? <EmptyState icon={Calendar} title="No upcoming events" message="Events added to the academic calendar appear here." /> : null}>
              {d?.upcoming_events?.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 border-b border-slate-50 px-4 py-3 last:border-0">
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-[#0b1a4a]">{e.title}</p><p className="text-xs text-slate-500">{fmtPlain(e.start_date)}{e.end_date !== e.start_date ? ` to ${fmtPlain(e.end_date)}` : ''}</p></div>
                  {e.type && <StatusBadge tone="purple">{cap(e.type)}</StatusBadge>}
                </div>
              ))}
            </Body>
          </Card>
          <Card title="Announcements" action={<Link href="/dashboard/announcements" className={linkCls}>Manage</Link>}>
            <Body loading={L} bad={bad(d?.announcements)} onRetry={load} empty={d?.announcements && d.announcements.length === 0 ? <EmptyState icon={Megaphone} title="No announcements yet" /> : null}>
              {d?.announcements?.map((a) => (
                <div key={a.id} className="border-b border-slate-50 px-4 py-3 last:border-0"><p className="text-sm font-medium text-[#0b1a4a]">{a.title}</p><p className="text-xs text-slate-500">{fmtDate(a.created_at)}</p></div>
              ))}
            </Body>
          </Card>
          <Card title="Recent registrations" action={<Link href="/school-admin/students" className={linkCls}>Students</Link>}>
            <Body loading={L} bad={bad(d?.recent_registrations)} onRetry={load} empty={d?.recent_registrations && d.recent_registrations.length === 0 ? <EmptyState icon={Users} title="No registrations yet" /> : null}>
              {d?.recent_registrations?.map((u) => (
                <div key={u.id} className="flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0">
                  <Avatar name={u.full_name} size={36} />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#0b1a4a]">{u.full_name}</p><p className="text-xs text-slate-500">{cap(u.role)} - {fmtDate(u.created_at)}</p></div>
                </div>
              ))}
            </Body>
          </Card>
          <Card title="Top courses by enrolment" action={<Link href="/dashboard/courses" className={linkCls}>Courses</Link>}>
            <Body loading={L} bad={bad(d?.top_courses)} onRetry={load} empty={d?.top_courses && d.top_courses.length === 0 ? <EmptyState icon={BookOpen} title="No courses yet" /> : null}>
              {d?.top_courses?.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 border-b border-slate-50 px-4 py-3 last:border-0">
                  <p className="truncate text-sm font-medium text-[#0b1a4a]">{c.title}</p>
                  <span className="shrink-0 text-xs text-slate-500">{c.enrolled} enrolled</span>
                </div>
              ))}
            </Body>
          </Card>
        </div>

        <Card title="Tools">
          <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-5">
            {TOOLS.map(({ icon: Icon, label, href }) => (
              <Link key={label} href={href} aria-label={label} className="flex min-h-11 items-center gap-2.5 rounded-xl border border-slate-100 px-3 py-2.5 text-sm font-medium text-[#0b1a4a] outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500">
                <Icon className="h-[18px] w-[18px] shrink-0 text-blue-600" /><span className="truncate">{label}</span>
                {label === 'Approvals' && t && t.pending_approvals > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{t.pending_approvals}</span>}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
