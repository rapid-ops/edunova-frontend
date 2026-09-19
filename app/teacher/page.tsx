'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom, getSocket } from '@/lib/socket';
import api from '@/lib/api';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    if (user) {
      joinRoom(user.id);
      fetchData();
      const socket = getSocket();
      socket.on('new_notification', (n: any) => {
        setNotifications((prev) => [n, ...prev]);
      });
      return () => { socket.off('new_notification'); };
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [coursesRes, notifRes] = await Promise.all([
        api.get(`/courses/school/${user?.school_id || 1}`),
        api.get(`/notifications/${user?.id}`),
      ]);
      setCourses(coursesRes.data.courses.filter((c: any) => c.teacher_id === user?.id));
      setNotifications(notifRes.data.notifications.filter((n: any) => !n.is_read));
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Teacher Portal</h1>
          <p className="text-gray-500 text-xs">Edunova</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.full_name}</span>
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="text-sm text-red-400">Logout</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {notifications.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <p className="text-blue-400 font-medium text-sm mb-2">{notifications.length} new notifications</p>
            {notifications.slice(0, 2).map((n) => (
              <p key={n.id} className="text-gray-300 text-sm py-1">{n.title} — {n.body}</p>
            ))}
          </div>
        )}

        <p className="text-gray-400 mb-4">Welcome, <span className="text-white font-medium">{user?.full_name}</span></p>

        <h2 className="font-semibold mb-3">My Courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500 text-sm mb-6">No courses assigned yet.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {courses.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/dashboard/courses/${c.id}`)}
                className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 cursor-pointer transition"
              >
                <h3 className="font-medium">{c.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{c.description}</p>
                <span className={`text-xs mt-2 inline-block px-2 py-1 rounded-full ${c.is_published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {c.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'Mark Attendance', href: '/dashboard/attendance' },
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
