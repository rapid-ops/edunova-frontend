'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom } from '@/lib/socket';
import api from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({ schools: 0, courses: 0, students: 0, teachers: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    if (user) {
      joinRoom(user.id);
      fetchStats();
      fetchNotifications();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [schoolsRes, coursesRes, usersRes] = await Promise.all([
        api.get('/schools'),
        api.get('/courses/school/1'),
        api.get('/auth/users/1'),
      ]);
      const users = usersRes.data.users;
      setStats({
        schools: schoolsRes.data.schools.length,
        courses: coursesRes.data.courses.length,
        students: users.filter((u: any) => u.role === 'student').length,
        teachers: users.filter((u: any) => u.role === 'teacher').length,
      });
    } catch (err) {}
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/notifications/${user.id}`);
      setNotifications(res.data.notifications.filter((n: any) => !n.is_read));
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Edunova</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.full_name}</span>
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="text-sm text-red-400">Logout</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {notifications.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <p className="text-blue-400 font-medium text-sm mb-2">Notifications ({notifications.length})</p>
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="text-sm text-gray-300 py-1 border-b border-blue-500/10 last:border-0">
                <span className="font-medium">{n.title}</span> — {n.body}
              </div>
            ))}
          </div>
        )}

        <p className="text-gray-400 mb-6">Welcome back, <span className="text-white font-medium">{user?.full_name}</span></p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Schools', value: stats.schools },
            { label: 'Courses', value: stats.courses },
            { label: 'Students', value: stats.students },
            { label: 'Teachers', value: stats.teachers },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'Manage Schools', href: '/dashboard/schools' },
            { label: 'Manage Classes', href: '/dashboard/classes' },
            { label: 'Timetable', href: '/dashboard/timetable' },
            { label: 'Manage Courses', href: '/dashboard/courses' },
            { label: 'Manage Students', href: '/dashboard/students' },
            { label: 'Results & Grades', href: '/dashboard/results' },
            { label: 'Attendance', href: '/dashboard/attendance' },
            { label: 'Fees', href: '/dashboard/fees' },
            { label: 'Send Notifications', href: '/dashboard/notifications' },
            { label: 'Messages', href: '/dashboard/messages' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="w-full bg-gray-900 border border-gray-800 hover:border-blue-500 text-left px-5 py-4 rounded-xl text-sm font-medium transition"
            >
              {item.label} →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
