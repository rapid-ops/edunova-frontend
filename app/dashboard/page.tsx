'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom } from '@/lib/socket';
import api from '@/lib/api';
import { Bell, School, BarChart2, Headphones, ChevronRight, Shield, Zap, Tag, ScrollText, TrendingDown, Bot, CreditCard } from 'lucide-react';

const naira = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0);
const monthName = (m: string) => new Intl.DateTimeFormat('en-NG', { timeZone: 'UTC', month: 'short' }).format(new Date(m + '-15T12:00:00Z'));
const STATUS_LABEL: Record<string, string> = { active: 'Active', trial: 'On trial', expired: 'Expired', cancelled: 'Cancelled', none: 'No plan' };

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    if (user) {
      if (user.role === 'school_admin') { router.replace('/school-admin'); return; }
      if (user.role === 'teacher') { router.replace('/teacher'); return; }
      if (user.role === 'student') { router.replace('/student'); return; }
      if (user.role === 'parent') { router.replace('/parent'); return; }
      joinRoom(user.id);
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setFailed(false);
    try {
      const [ov, notifRes] = await Promise.all([
        api.get('/owner/overview'),
        api.get(`/notifications/${user?.id}`).catch(() => null),
      ]);
      setData(ov.data);
      setNotifications(((notifRes && notifRes.data.notifications) || []).filter((n: any) => !n.is_read));
    } catch { setFailed(true); }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" /></div>;

  const t = data?.totals;
  const rev = data?.revenue;
  const subs: Record<string, number> = data?.subscriptions || {};
  const months: any[] = rev?.months || [];
  const maxMonth = Math.max(1, ...months.map((m: any) => m.amount));
  const tickets: any[] = data?.open_tickets || [];
  const recent: any[] = data?.recent_schools || [];

  const Tile = ({ label, value, sub, href, color }: { label: string; value: string | number; sub?: string; href?: string; color?: string }) => (
    <button onClick={() => href && router.push(href)} className="bg-white border border-gray-200 rounded-xl p-4 text-left active:bg-gray-50">
      <p className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">Edunova HQ</p><h1 className="text-lg font-bold text-gray-900">Owner</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
        {failed && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">Could not load the platform numbers. Pull down to refresh or try again shortly.</p>}

        {notifications.length > 0 && (
          <button onClick={() => router.push('/dashboard/notifications')} className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-left">
            <Bell size={18} className="text-blue-600 shrink-0" />
            <p className="text-blue-600 font-medium text-sm flex-1">{notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
            <ChevronRight size={16} className="text-blue-400 shrink-0" />
          </button>
        )}

        {t && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Tile label="Schools" value={t.schools} sub={`${t.active_schools} active, ${t.new_schools_30d} new in 30 days`} href="/dashboard/schools" color="text-blue-600" />
              <Tile label="Total users" value={t.users} sub={`${t.students} students, ${t.teachers} teachers`} href="/dashboard/schools" />
              <Tile label="Subscription income" value={naira(rev?.total || 0)} sub={`${naira(rev?.this_month || 0)} this month`} href="/dashboard/billing" color="text-green-600" />
              <Tile label="Open tickets" value={t.open_tickets} href="/dashboard/b2b-support" color="text-red-500" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="font-semibold text-sm mb-3">School subscriptions</p>
              <div className="grid grid-cols-5 gap-2 text-center">
                {['active', 'trial', 'expired', 'cancelled', 'none'].map((k) => (
                  <div key={k}><p className="text-lg font-bold">{subs[k] || 0}</p><p className="text-[11px] text-gray-400 leading-tight">{STATUS_LABEL[k]}</p></div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="font-semibold text-sm mb-3">Income, last 6 months</p>
              {months.length === 0 ? <p className="text-sm text-gray-400">No paid subscriptions yet.</p> : (
                <div className="flex items-end gap-2 h-28">
                  {months.map((m: any) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="w-full rounded-t bg-blue-500" style={{ height: `${Math.max(4, (m.amount / maxMonth) * 100)}%` }} title={naira(m.amount)} />
                      <p className="text-[10px] text-gray-400 mt-1">{monthName(m.month)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {recent.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><School size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">Newest schools</h2></div>
              <button onClick={() => router.push('/dashboard/schools')} className="text-xs text-blue-600">See all</button>
            </div>
            {recent.map((s: any) => (
              <button key={s.id} onClick={() => router.push('/dashboard/schools')} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 text-left active:bg-gray-50">
                <div className="min-w-0"><p className="text-sm font-medium truncate">{s.name}</p><p className="text-xs text-gray-400 mt-0.5">{s.total_users} users - {s.plan_name || 'no plan'}</p></div>
                <span className={`text-xs shrink-0 ml-2 ${s.is_active ? 'text-green-600' : 'text-gray-400'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
              </button>
            ))}
          </div>
        )}

        {tickets.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><Headphones size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">School support tickets</h2></div>
              <button onClick={() => router.push('/dashboard/b2b-support')} className="text-xs text-blue-600">See all</button>
            </div>
            {tickets.map((x: any) => (
              <button key={x.id} onClick={() => router.push('/dashboard/b2b-support')} className="w-full flex items-start justify-between px-4 py-3 border-b border-gray-50 last:border-0 text-left active:bg-gray-50">
                <div><p className="text-sm font-medium text-gray-900">{x.subject}</p><p className="text-xs text-gray-400 mt-0.5">{x.school_name} - {new Date(x.created_at).toLocaleDateString()}</p></div>
                <span className="text-xs text-gray-400 ml-2 shrink-0">{x.priority}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: School, label: 'Schools', href: '/dashboard/schools', color: 'text-blue-600' },
            { icon: CreditCard, label: 'Billing rules', href: '/dashboard/billing', color: 'text-green-600' },
            { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics', color: 'text-indigo-600' },
            { icon: Bot, label: 'AI Studio', href: '/dashboard/ai-studio', color: 'text-purple-600' },
            { icon: Zap, label: 'Automations', href: '/dashboard/automations', color: 'text-yellow-500' },
            { icon: Tag, label: 'Coupons', href: '/dashboard/coupons', color: 'text-pink-500' },
            { icon: Shield, label: 'Custom Roles', href: '/dashboard/custom-roles', color: 'text-green-600' },
            { icon: ScrollText, label: 'Audit Logs', href: '/dashboard/audit-logs', color: 'text-gray-600' },
            { icon: TrendingDown, label: 'Dropout Risk', href: '/dashboard/dropout-risk', color: 'text-red-500' },
          ].map(({ icon: Icon, label, href, color }) => (
            <button key={label} onClick={() => router.push(href)} className="bg-white border border-gray-200 active:bg-gray-50 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition">
              <Icon size={18} className={color} />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
