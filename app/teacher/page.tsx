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
  const [sessions, setSessions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = days[new Date().getDay()];

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
      const [assignedRes, notifRes, sessionsRes, announceRes, ttRes] = await Promise.all([
        api.get(`/course-assignments/teacher/${user?.id}`),
        api.get(`/notifications/${user?.id}`),
        api.get(`/class-sessions/teacher/${user?.id}`),
        api.get(`/announcements/teacher/${user?.id}/${user?.school_id}`),
        api.get(`/timetable/school/${user?.school_id}`),
      ]);
      setCourses(assignedRes.data.courses || []);
      setNotifications((notifRes.data.notifications || []).filter((n: any) => !n.is_read));
      setSessions((sessionsRes.data.sessions || []).filter((s: any) => s.is_active));
      setAnnouncements((announceRes.data.announcements || []).slice(0, 3));
      setTodayClasses((ttRes.data.timetable || []).filter((t: any) => t.day_of_week === today && t.teacher_id === user?.id));
    } catch (err) {}
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">Teacher Portal</p><h1 className="text-lg font-bold text-gray-900">{user?.full_name?.split(' ')[0]} 👋</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {notifications.length > 0 && (
          <div onClick={() => router.push('/dashboard/notifications')} className="bg-blue-50 border border-blue-200 rounded-xl p-4 cursor-pointer">
            <p className="text-blue-600 font-medium text-sm">🔔 {notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-purple-600">{courses.length}</div><div className="text-xs text-gray-400 mt-0.5">Courses</div></div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-blue-600">{sessions.length}</div><div className="text-xs text-gray-400 mt-0.5">Live Q&As</div></div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-green-600">{todayClasses.length}</div><div className="text-xs text-gray-400 mt-0.5">Today</div></div>
        </div>

        {todayClasses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100"><h2 className="font-semibold text-sm text-gray-900">📅 Today's Classes</h2></div>
            {todayClasses.map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div><p className="text-sm font-medium text-gray-900">{t.course_title || t.course_id}</p><p className="text-xs text-gray-400">{t.class_name || t.class_id}</p></div>
                <span className="text-xs text-gray-500">{t.start_time?.slice(0,5)} – {t.end_time?.slice(0,5)}</span>
              </div>
            ))}
          </div>
        )}

        {courses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-sm text-gray-900">My Assigned Courses</h2>
              <button onClick={() => router.push('/dashboard/course-assignments')} className="text-xs text-blue-600">See all</button>
            </div>
            {courses.slice(0, 4).map((c: any) => (
              <div key={c.id} onClick={() => router.push(`/dashboard/courses/${c.course_id}`)} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer active:bg-gray-50">
                <div><p className="text-sm font-medium text-gray-900">{c.title}</p><p className="text-xs text-gray-400">{c.class_name || 'No class'}</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_published ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{c.is_published ? 'Live' : 'Draft'}</span>
              </div>
            ))}
          </div>
        )}

        {sessions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-sm text-gray-900">🟢 Active Q&A Sessions</h2>
              <button onClick={() => router.push('/dashboard/class-sessions')} className="text-xs text-blue-600">Manage</button>
            </div>
            {sessions.map((s: any) => (
              <div key={s.id} onClick={() => router.push('/dashboard/class-sessions')} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer">
                <div><p className="text-sm font-medium text-gray-900">{s.title}</p><p className="text-xs text-gray-400">{s.question_count} questions</p></div>
                <span className="font-mono font-bold text-blue-600 text-sm">{s.code}</span>
              </div>
            ))}
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

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '✅ Mark Attendance', href: '/dashboard/attendance' },
            { label: '📊 Gradebook', href: '/dashboard/gradebook' },
            { label: '🧪 Start Q&A', href: '/dashboard/class-sessions' },
            { label: '💬 Messages', href: '/dashboard/messages' },
            { label: '🔬 Virtual Labs', href: '/dashboard/virtual-labs' },
            { label: '💡 Suggest', href: '/dashboard/suggestions' },
          ].map(item => (
            <button key={item.label} onClick={() => router.push(item.href)} className="bg-white border border-gray-200 active:bg-gray-50 text-left px-4 py-3 rounded-xl text-sm font-medium transition">{item.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
