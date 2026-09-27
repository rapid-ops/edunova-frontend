'use client';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom, getSocket } from '@/lib/socket';
import api from '@/lib/api';
import { Bell, BookOpen, Trophy, ClipboardList, Calendar, MessageCircle, ChevronRight, FlaskConical, FileCheck, Lightbulb, RefreshCcw, Presentation, UserCog } from 'lucide-react';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
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

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">Teacher Portal</p><h1 className="text-lg font-bold text-gray-900">{user?.full_name?.split(' ')[0]}</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {notifications.length > 0 && (
          <button onClick={() => router.push('/dashboard/notifications')} className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-left">
            <Bell size={18} className="text-blue-600 shrink-0" />
            <p className="text-blue-600 font-medium text-sm flex-1">{notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
            <ChevronRight size={16} className="text-blue-400 shrink-0" />
          </button>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-purple-600">{courses.length}</p><p className="text-xs text-gray-400 mt-0.5">Courses</p></div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-600">{sessions.length}</p><p className="text-xs text-gray-400 mt-0.5">Live Q&As</p></div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-600">{todayClasses.length}</p><p className="text-xs text-gray-400 mt-0.5">Today</p></div>
        </div>

        {todayClasses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100"><Calendar size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">Today's Classes</h2></div>
            {todayClasses.map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div><p className="text-sm font-medium text-gray-900">{t.course_title || `Course ${t.course_id}`}</p><p className="text-xs text-gray-400">{t.class_name || `Class ${t.class_id}`}</p></div>
                <span className="text-xs text-gray-500 font-medium">{t.start_time?.slice(0,5)} – {t.end_time?.slice(0,5)}</span>
              </div>
            ))}
          </div>
        )}

        {sessions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><Presentation size={15} className="text-green-500" /><h2 className="font-semibold text-sm text-gray-900">Live Q&A Sessions</h2></div>
              <button onClick={() => router.push('/dashboard/class-sessions')} className="text-xs text-blue-600">Manage</button>
            </div>
            {sessions.map((s: any) => (
              <button key={s.id} onClick={() => router.push('/dashboard/class-sessions')} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 text-left active:bg-gray-50">
                <div><p className="text-sm font-medium text-gray-900">{s.title}</p><p className="text-xs text-gray-400">{s.question_count} questions</p></div>
                <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded-lg">{s.code}</span>
              </button>
            ))}
          </div>
        )}

        {courses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><BookOpen size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">My Courses</h2></div>
              <button onClick={() => router.push('/dashboard/course-assignments')} className="text-xs text-blue-600">See all</button>
            </div>
            {courses.slice(0, 4).map((c: any) => (
              <button key={c.id} onClick={() => router.push(`/dashboard/courses/${c.course_id}`)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 text-left active:bg-gray-50">
                <div><p className="text-sm font-medium text-gray-900">{c.title}</p><p className="text-xs text-gray-400">{c.class_name || 'No class assigned'}</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_published ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{c.is_published ? 'Live' : 'Draft'}</span>
              </button>
            ))}
          </div>
        )}

        {announcements.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><Bell size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">Announcements</h2></div>
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
            { icon: ClipboardList, label: 'Attendance', href: '/dashboard/attendance', color: 'text-blue-600' },
            { icon: Trophy, label: 'Gradebook', href: '/dashboard/gradebook', color: 'text-yellow-600' },
            { icon: Presentation, label: 'Start Q&A', href: '/dashboard/class-sessions', color: 'text-green-600' },
            { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages', color: 'text-purple-600' },
            { icon: FlaskConical, label: 'Virtual Labs', href: '/dashboard/virtual-labs', color: 'text-teal-600' },
            { icon: FileCheck, label: 'Proof of Work', href: '/dashboard/proof-of-work', color: 'text-orange-500' },
            { icon: Lightbulb, label: 'Suggestions', href: '/dashboard/suggestions', color: 'text-yellow-500' },
            { icon: RefreshCcw, label: 'Course Evolution', href: '/dashboard/course-evolution', color: 'text-indigo-600' },
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
