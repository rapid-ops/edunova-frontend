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
  const [stats, setStats] = useState({ courses: 0, students: 0, teachers: 0, fees_pending: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    if (user && schoolId) {
      joinRoom(user.id);
      fetchData();
      const socket = getSocket();
      socket.on('new_notification', (n: any) => setNotifications((prev) => [n, ...prev]));
      return () => { socket.off('new_notification'); };
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, coursesRes, feesRes, schoolRes] = await Promise.all([
        api.get(`/auth/users/${schoolId}`),
        api.get(`/courses/school/${schoolId}`),
        api.get(`/fees/school/${schoolId}`),
        api.get(`/schools/${schoolId}`),
      ]);
      const users = usersRes.data.users;
      setStats({
        courses: coursesRes.data.courses.length,
        students: users.filter((u: any) => u.role === 'student').length,
        teachers: users.filter((u: any) => u.role === 'teacher').length,
        fees_pending: feesRes.data.fees.filter((f: any) => f.status === 'pending').length,
      });
      setSchool(schoolRes.data.school);
      const notifRes = await api.get(`/notifications/${user?.id}`);
      setNotifications(notifRes.data.notifications.filter((n: any) => !n.is_read));
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{school?.name || 'School Admin'}</h1>
          <p className="text-gray-500 text-xs">Edunova</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/profile')} className="text-gray-500 text-sm">Profile</button>
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="text-sm text-red-400">Logout</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {notifications.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <p className="text-blue-400 font-medium text-sm mb-2">{notifications.length} unread</p>
            {notifications.slice(0, 2).map((n) => (
              <p key={n.id} className="text-gray-600 text-sm py-1">{n.title} — {n.body}</p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Courses', value: stats.courses, color: 'text-blue-400' },
            { label: 'Students', value: stats.students, color: 'text-green-400' },
            { label: 'Teachers', value: stats.teachers, color: 'text-purple-400' },
            { label: 'Pending Fees', value: stats.fees_pending, color: 'text-yellow-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-gray-500 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'Manage Classes', href: '/dashboard/classes' },
            { label: 'Timetable', href: '/dashboard/timetable' },
            { label: 'Manage Courses', href: '/dashboard/courses' },
            { label: 'Manage Students & Teachers', href: '/dashboard/students' },
            { label: 'Parent Management', href: '/dashboard/parents' },
            { label: 'Results & Grades', href: '/dashboard/results' },
            { label: 'Report Cards', href: '/dashboard/reportcard' },
            { label: 'Attendance', href: '/dashboard/attendance' },
            { label: 'Fees', href: '/dashboard/fees' },
            { label: 'Send Notifications', href: '/dashboard/notifications' },
            { label: 'Messages', href: '/dashboard/messages' },
            { label: 'School Website', href: '/dashboard/website' },
            { label: 'Subscription', href: '/subscription' },
          ].map((item) => (
            <button key={item.label} onClick={() => router.push(item.href)} className="w-full bg-white border border-gray-200 hover:border-blue-500 text-left px-5 py-4 rounded-xl text-sm font-medium transition">
              {item.label} →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
