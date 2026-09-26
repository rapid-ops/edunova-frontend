'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom, getSocket } from '@/lib/socket';
import api from '@/lib/api';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
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
      const [enrollRes, notifRes, resultsRes, announceRes] = await Promise.all([
        api.get(`/enrollments/student/${user?.id}`),
        api.get(`/notifications/${user?.id}`),
        api.get(`/results/student/${user?.id}`),
        api.get(`/announcements/student/${user?.id}/${user?.school_id}`),
      ]);
      setEnrollments(enrollRes.data.enrollments || []);
      setNotifications((notifRes.data.notifications || []).filter((n: any) => !n.is_read));
      setResults((resultsRes.data.results || []).slice(0, 5));
      setAnnouncements((announceRes.data.announcements || []).slice(0, 3));
    } catch (err) {}
    setLoading(false);
  };

  const gradeInfo = (score: number, total: number) => {
    const p = (score / total) * 100;
    return p >= 70 ? { g: 'A', c: 'text-green-600' } : p >= 60 ? { g: 'B', c: 'text-blue-600' } : p >= 50 ? { g: 'C', c: 'text-yellow-600' } : p >= 45 ? { g: 'D', c: 'text-orange-500' } : { g: 'F', c: 'text-red-500' };
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">{greeting}</p><h1 className="text-lg font-bold text-gray-900">{user?.full_name?.split(' ')[0]} 👋</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {notifications.length > 0 && (
          <div onClick={() => router.push('/dashboard/notifications')} className="bg-blue-50 border border-blue-200 rounded-xl p-4 cursor-pointer">
            <p className="text-blue-600 font-medium text-sm">🔔 {notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
            <p className="text-gray-600 text-xs mt-1 truncate">{notifications[0]?.title}</p>
          </div>
        )}

        {announcements.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-sm text-gray-900">📢 Announcements</h2>
              <button onClick={() => router.push('/dashboard/announcements')} className="text-xs text-blue-600">See all</button>
            </div>
            {announcements.map(a => (
              <div key={a.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.author_name} · {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-blue-600">{enrollments.length}</div><div className="text-xs text-gray-400 mt-0.5">Courses</div></div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-green-600">{results.filter(r => (r.score / r.total_marks) >= 0.5).length}</div><div className="text-xs text-gray-400 mt-0.5">Passed</div></div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-purple-600">{results.length}</div><div className="text-xs text-gray-400 mt-0.5">Results</div></div>
        </div>

        {enrollments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-sm text-gray-900">My Courses</h2>
              <button onClick={() => router.push('/dashboard/courses')} className="text-xs text-blue-600">See all</button>
            </div>
            {enrollments.slice(0, 4).map(e => (
              <div key={e.id} onClick={() => router.push(`/dashboard/courses/${e.course_id}`)} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer active:bg-gray-50">
                <div><p className="text-sm font-medium text-gray-900">{e.course_title}</p><p className="text-xs text-gray-400">Tap to open</p></div>
                <span className="text-gray-300 text-lg">›</span>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-sm text-gray-900">Recent Results</h2>
              <button onClick={() => router.push('/dashboard/gradebook')} className="text-xs text-blue-600">Gradebook</button>
            </div>
            {results.map(r => {
              const { g, c } = gradeInfo(r.score, r.total_marks);
              return (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-medium text-gray-900">{r.assessment_title}</p><p className="text-xs text-gray-400 capitalize">{r.type}</p></div>
                  <div className="text-right"><p className="text-xs text-gray-400">{r.score}/{r.total_marks}</p><p className={`text-xl font-bold ${c}`}>{g}</p></div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '🤖 AI Tutor', href: '/dashboard/ai-tutor' },
            { label: '🧠 My Twin', href: '/dashboard/learning-twin' },
            { label: '💼 Career', href: '/dashboard/career' },
            { label: '📋 Timetable', href: '/dashboard/timetable' },
            { label: '🎓 Certificates', href: '/dashboard/certificates' },
            { label: '📝 Assignments', href: '/student/assignments' },
          ].map(item => (
            <button key={item.label} onClick={() => router.push(item.href)} className="bg-white border border-gray-200 active:bg-gray-50 text-left px-4 py-3 rounded-xl text-sm font-medium transition">{item.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
