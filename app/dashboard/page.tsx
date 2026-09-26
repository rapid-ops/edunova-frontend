'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom } from '@/lib/socket';
import api from '@/lib/api';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({ schools: 0, total_students: 0, total_teachers: 0, open_tickets: 0 });
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
      const schools = schoolsRes.data.schools || [];
      setStats({ schools: schools.length, total_students: 0, total_teachers: 0, open_tickets: (ticketsRes.data.tickets || []).filter((t: any) => t.status === 'open').length });
      setNotifications((notifRes.data.notifications || []).filter((n: any) => !n.is_read));
      setTickets((ticketsRes.data.tickets || []).filter((t: any) => t.status === 'open').slice(0, 5));
    } catch (err) {}
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">Edunova HQ</p><h1 className="text-lg font-bold text-gray-900">Super Admin 👋</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {notifications.length > 0 && (
          <div onClick={() => router.push('/dashboard/notifications')} className="bg-blue-50 border border-blue-200 rounded-xl p-4 cursor-pointer">
            <p className="text-blue-600 font-medium text-sm">🔔 {notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div onClick={() => router.push('/dashboard/schools')} className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer active:bg-gray-50">
            <div className="text-3xl font-bold text-blue-600">{stats.schools}</div>
            <div className="text-sm text-gray-400 mt-1">Active Schools</div>
          </div>
          <div onClick={() => router.push('/dashboard/b2b-support')} className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer active:bg-gray-50">
            <div className="text-3xl font-bold text-red-500">{stats.open_tickets}</div>
            <div className="text-sm text-gray-400 mt-1">Open Tickets</div>
          </div>
        </div>

        {tickets.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-sm text-gray-900">🆘 School Support Tickets</h2>
              <button onClick={() => router.push('/dashboard/b2b-support')} className="text-xs text-blue-600">See all</button>
            </div>
            {tickets.map(t => (
              <div key={t.id} onClick={() => router.push('/dashboard/b2b-support')} className="px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer active:bg-gray-50">
                <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-900">{t.subject}</p><span className="text-xs text-gray-400">{t.priority}</span></div>
                <p className="text-xs text-gray-400 mt-0.5">{t.school_name} · {new Date(t.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '🏫 Schools', href: '/dashboard/schools' },
            { label: '📊 Analytics', href: '/dashboard/analytics' },
            { label: '🤖 AI Studio', href: '/dashboard/ai-studio' },
            { label: '⚙️ Automations', href: '/dashboard/automations' },
            { label: '🎟 Coupons', href: '/dashboard/coupons' },
            { label: '🛡 Roles', href: '/dashboard/custom-roles' },
            { label: '📋 Audit Logs', href: '/dashboard/audit-logs' },
            { label: '📉 Dropout Risk', href: '/dashboard/dropout-risk' },
          ].map(item => (
            <button key={item.label} onClick={() => router.push(item.href)} className="bg-white border border-gray-200 active:bg-gray-50 text-left px-4 py-3 rounded-xl text-sm font-medium transition">{item.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
