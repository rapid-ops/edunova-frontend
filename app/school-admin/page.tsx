'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom, getSocket } from '@/lib/socket';
import api from '@/lib/api';

export default function SchoolAdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const schoolId = user?.school_id;
  const [stats, setStats] = useState({ courses: 0, students: 0, teachers: 0, pending_fees: 0, suggestions: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dropout, setDropout] = useState<any[]>([]);
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    if (user) {
      joinRoom(user.id);
      fetchData();
      const socket = getSocket();
      socket.on('new_notification', (n: any) => setNotifications(p => [n, ...p]));
      return () => { socket.off('new_notification'); };
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, coursesRes, notifRes, schoolRes, announceRes, suggestRes, dropoutRes] = await Promise.all([
        api.get(`/auth/users/${schoolId}`),
        api.get(`/courses/school/${schoolId}`),
        api.get(`/notifications/${user?.id}`),
        api.get(`/schools/${schoolId}`),
        api.get(`/announcements/school/${schoolId}`),
        api.get(`/suggestions/${schoolId}`),
        api.get(`/dropout/${schoolId}`),
      ]);
      const users = usersRes.data.users || [];
      setStats({
        courses: coursesRes.data.courses?.length || 0,
        students: users.filter((u: any) => u.role === 'student').length,
        teachers: users.filter((u: any) => u.role === 'teacher').length,
        pending_fees: 0,
        suggestions: (suggestRes.data.suggestions || []).filter((s: any) => s.status === 'unread').length,
      });
      setNotifications((notifRes.data.notifications || []).filter((n: any) => !n.is_read));
      setSchool(schoolRes.data.school);
      setAnnouncements((announceRes.data.announcements || []).slice(0, 3));
      setDropout((dropoutRes.data.predictions || []).filter((p: any) => p.risk_level === 'high' || p.risk_level === 'critical').slice(0, 3));
    } catch (err) {}
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">{school?.name || 'School Admin'}</p><h1 className="text-lg font-bold text-gray-900">{user?.full_name?.split(' ')[0]} 👋</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {notifications.length > 0 && (
          <div onClick={() => router.push('/dashboard/notifications')} className="bg-blue-50 border border-blue-200 rounded-xl p-4 cursor-pointer">
            <p className="text-blue-600 font-medium text-sm">🔔 {notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
          </div>
        )}

        {stats.suggestions > 0 && (
          <div onClick={() => router.push('/dashboard/suggestions')} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 cursor-pointer flex items-center justify-between">
            <p className="text-yellow-700 font-medium text-sm">💡 {stats.suggestions} unread suggestion{stats.suggestions > 1 ? 's' : ''}</p>
            <span className="text-yellow-600 text-xs">View →</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div onClick={() => router.push('/dashboard/students')} className="bg-white border border-gray-200 rounded-xl p-3 text-center cursor-pointer active:bg-gray-50">
            <div className="text-2xl font-bold text-blue-600">{stats.students}</div>
            <div className="text-xs text-gray-400 mt-0.5">Students</div>
          </div>
          <div onClick={() => router.push('/dashboard/students')} className="bg-white border border-gray-200 rounded-xl p-3 text-center cursor-pointer active:bg-gray-50">
            <div className="text-2xl font-bold text-purple-600">{stats.teachers}</div>
            <div className="text-xs text-gray-400 mt-0.5">Teachers</div>
          </div>
          <div onClick={() => router.push('/dashboard/courses')} className="bg-white border border-gray-200 rounded-xl p-3 text-center cursor-pointer active:bg-gray-50">
            <div className="text-2xl font-bold text-green-600">{stats.courses}</div>
            <div className="text-xs text-gray-400 mt-0.5">Courses</div>
          </div>
        </div>

        {dropout.length > 0 && (
          <div onClick={() => router.push('/dashboard/dropout-risk')} className="bg-red-50 border border-red-200 rounded-xl p-4 cursor-pointer">
            <p className="text-red-600 font-semibold text-sm mb-2">⚠️ {dropout.length} student{dropout.length > 1 ? 's' : ''} at dropout risk</p>
            {dropout.map(d => (
              <div key={d.id} className="flex items-center justify-between py-1">
                <p className="text-sm text-gray-700">{d.full_name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.risk_level === 'critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{d.risk_level}</span>
              </div>
            ))}
          </div>
        )}

        {announcements.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-sm text-gray-900">📢 Announcements</h2>
              <button onClick={() => router.push('/dashboard/announcements')} className="text-xs text-blue-600">Manage</button>
            </div>
            {announcements.map(a => (
              <div key={a.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-900">{a.title}</p><span className="text-xs text-gray-400 capitalize">{a.target_role}</span></div>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '👤 Manage Students', href: '/dashboard/students' },
            { label: '📚 Course Assign', href: '/dashboard/course-assignments' },
            { label: '💰 Fees', href: '/dashboard/fees' },
            { label: '✅ Attendance', href: '/dashboard/attendance' },
            { label: '📊 Analytics', href: '/dashboard/analytics' },
            { label: '📋 Timetable', href: '/dashboard/timetable' },
            { label: '📝 Transcripts', href: '/dashboard/transcripts' },
            { label: '🎓 Gradebook', href: '/dashboard/gradebook' },
            { label: '🎟 Coupons', href: '/dashboard/coupons' },
            { label: '🆘 Support', href: '/dashboard/b2b-support' },
          ].map(item => (
            <button key={item.label} onClick={() => router.push(item.href)} className="bg-white border border-gray-200 active:bg-gray-50 text-left px-4 py-3 rounded-xl text-sm font-medium transition">{item.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
