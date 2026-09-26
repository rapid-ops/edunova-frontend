'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom, getSocket } from '@/lib/socket';
import api from '@/lib/api';
import { Bell, Users, BookOpen, Trophy, ClipboardList, Calendar, DollarSign, BarChart2, ChevronRight, UserCog, Lightbulb, Headphones, Zap, TrendingDown, Tag, ScrollText, AlertTriangle, Megaphone } from 'lucide-react';

export default function SchoolAdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.school_id;
  const [stats, setStats] = useState({ courses: 0, students: 0, teachers: 0, suggestions: 0 });
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
        suggestions: (suggestRes.data.suggestions || []).filter((s: any) => s.status === 'unread').length,
      });
      setNotifications((notifRes.data.notifications || []).filter((n: any) => !n.is_read));
      setSchool(schoolRes.data.school);
      setAnnouncements((announceRes.data.announcements || []).slice(0, 3));
      setDropout((dropoutRes.data.predictions || []).filter((p: any) => ['high','critical'].includes(p.risk_level)).slice(0, 3));
    } catch (err) {}
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">{school?.name || 'School Admin'}</p><h1 className="text-lg font-bold text-gray-900">{user?.full_name?.split(' ')[0]}</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {notifications.length > 0 && (
          <button onClick={() => router.push('/dashboard/notifications')} className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-left">
            <Bell size={18} className="text-blue-600 shrink-0" />
            <p className="text-blue-600 font-medium text-sm flex-1">{notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
            <ChevronRight size={16} className="text-blue-400 shrink-0" />
          </button>
        )}

        {stats.suggestions > 0 && (
          <button onClick={() => router.push('/dashboard/suggestions')} className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-3 text-left">
            <Lightbulb size={16} className="text-yellow-600 shrink-0" />
            <p className="text-yellow-700 font-medium text-sm flex-1">{stats.suggestions} unread suggestion{stats.suggestions > 1 ? 's' : ''}</p>
            <ChevronRight size={14} className="text-yellow-500 shrink-0" />
          </button>
        )}

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => router.push('/dashboard/students')} className="bg-white border border-gray-200 rounded-xl p-3 text-center active:bg-gray-50">
            <p className="text-2xl font-bold text-blue-600">{stats.students}</p><p className="text-xs text-gray-400 mt-0.5">Students</p>
          </button>
          <button onClick={() => router.push('/dashboard/students')} className="bg-white border border-gray-200 rounded-xl p-3 text-center active:bg-gray-50">
            <p className="text-2xl font-bold text-purple-600">{stats.teachers}</p><p className="text-xs text-gray-400 mt-0.5">Teachers</p>
          </button>
          <button onClick={() => router.push('/dashboard/courses')} className="bg-white border border-gray-200 rounded-xl p-3 text-center active:bg-gray-50">
            <p className="text-2xl font-bold text-green-600">{stats.courses}</p><p className="text-xs text-gray-400 mt-0.5">Courses</p>
          </button>
        </div>

        {dropout.length > 0 && (
          <button onClick={() => router.push('/dashboard/dropout-risk')} className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-left">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-red-500" /><p className="text-red-600 font-semibold text-sm">{dropout.length} student{dropout.length > 1 ? 's' : ''} at dropout risk</p></div>
            {dropout.map(d => (
              <div key={d.id} className="flex items-center justify-between py-1">
                <p className="text-sm text-gray-700">{d.full_name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.risk_level === 'critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{d.risk_level}</span>
              </div>
            ))}
          </button>
        )}

        {announcements.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><Megaphone size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">Announcements</h2></div>
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
            { icon: Users, label: 'Students', href: '/dashboard/students', color: 'text-blue-600' },
            { icon: UserCog, label: 'Course Assign', href: '/dashboard/course-assignments', color: 'text-purple-600' },
            { icon: DollarSign, label: 'Fees', href: '/dashboard/fees', color: 'text-green-600' },
            { icon: ClipboardList, label: 'Attendance', href: '/dashboard/attendance', color: 'text-orange-500' },
            { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics', color: 'text-indigo-600' },
            { icon: Calendar, label: 'Timetable', href: '/dashboard/timetable', color: 'text-blue-500' },
            { icon: Trophy, label: 'Gradebook', href: '/dashboard/gradebook', color: 'text-yellow-600' },
            { icon: ScrollText, label: 'Transcripts', href: '/dashboard/transcripts', color: 'text-gray-600' },
            { icon: Zap, label: 'Automations', href: '/dashboard/automations', color: 'text-yellow-500' },
            { icon: TrendingDown, label: 'Dropout Risk', href: '/dashboard/dropout-risk', color: 'text-red-500' },
            { icon: Tag, label: 'Coupons', href: '/dashboard/coupons', color: 'text-pink-500' },
            { icon: Headphones, label: 'Contact Support', href: '/dashboard/b2b-support', color: 'text-teal-600' },
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
