'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom } from '@/lib/socket';
import api from '@/lib/api';
import { Bell, School, BarChart2, Headphones, ChevronRight, Shield, Zap, Tag, ScrollText, TrendingDown, Bot } from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ schools: 0, open_tickets: 0 });
  const [tickets, setTickets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const [schoolsRes, notifRes, ticketsRes] = await Promise.all([
        api.get('/schools'),
        api.get(`/notifications/${user?.id}`),
        api.get('/b2b-tickets/all'),
      ]);
      const openTickets = (ticketsRes.data.tickets || []).filter((t: any) => t.status === 'open');
      setStats({ schools: schoolsRes.data.schools?.length || 0, open_tickets: openTickets.length });
      setNotifications((notifRes.data.notifications || []).filter((n: any) => !n.is_read));
      setTickets(openTickets.slice(0, 5));
    } catch (err) {}
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">Edunova HQ</p><h1 className="text-lg font-bold text-gray-900">Super Admin</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {notifications.length > 0 && (
          <button onClick={() => router.push('/dashboard/notifications')} className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-left">
            <Bell size={18} className="text-blue-600 shrink-0" />
            <p className="text-blue-600 font-medium text-sm flex-1">{notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
            <ChevronRight size={16} className="text-blue-400 shrink-0" />
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => router.push('/dashboard/schools')} className="bg-white border border-gray-200 rounded-xl p-4 text-left active:bg-gray-50">
            <p className="text-3xl font-bold text-blue-600">{stats.schools}</p><p className="text-sm text-gray-400 mt-1">Active Schools</p>
          </button>
          <button onClick={() => router.push('/dashboard/b2b-support')} className="bg-white border border-gray-200 rounded-xl p-4 text-left active:bg-gray-50">
            <p className="text-3xl font-bold text-red-500">{stats.open_tickets}</p><p className="text-sm text-gray-400 mt-1">Open Tickets</p>
          </button>
        </div>

        {tickets.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><Headphones size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">School Support Tickets</h2></div>
              <button onClick={() => router.push('/dashboard/b2b-support')} className="text-xs text-blue-600">See all</button>
            </div>
            {tickets.map(t => (
              <button key={t.id} onClick={() => router.push('/dashboard/b2b-support')} className="w-full flex items-start justify-between px-4 py-3 border-b border-gray-50 last:border-0 text-left active:bg-gray-50">
                <div><p className="text-sm font-medium text-gray-900">{t.subject}</p><p className="text-xs text-gray-400 mt-0.5">{t.school_name} · {new Date(t.created_at).toLocaleDateString()}</p></div>
                <span className="text-xs text-gray-400 ml-2 shrink-0">{t.priority}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: School, label: 'Schools', href: '/dashboard/schools', color: 'text-blue-600' },
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
