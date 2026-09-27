'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom, getSocket } from '@/lib/socket';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { Bell, BookOpen, Trophy, Brain, Bot, Briefcase, GraduationCap, Calendar, MessageCircle, ChevronRight, Zap, FlaskConical, BookMarked, Megaphone, Presentation } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    const stored = localStorage.getItem('user');
    if (stored) fetchData(JSON.parse(stored));
    const socket = getSocket();
    socket?.on('new_notification', (n: any) => setNotifications(p => [n, ...p]));
    return () => { socket?.off('new_notification'); };
  }, []);

  const fetchData = async (u: any) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';

      const [enrollRes, notifRes, resultsRes, announceRes] = await Promise.allSettled([
        fetch(`${API}/enrollments/student/${u.id}`, { headers }).then(r => r.json()),
        fetch(`${API}/notifications/${u.id}`, { headers }).then(r => r.json()),
        fetch(`${API}/results/student/${u.id}`, { headers }).then(r => r.json()),
        fetch(`${API}/announcements/student/${u.id}/${u.school_id}`, { headers }).then(r => r.json()),
      ]);

      if (enrollRes.status === 'fulfilled') setEnrollments(enrollRes.value.enrollments || []);
      if (notifRes.status === 'fulfilled') setNotifications((notifRes.value.notifications || []).filter((n: any) => !n.is_read));
      if (resultsRes.status === 'fulfilled') setResults((resultsRes.value.results || []).slice(0, 5));
      if (announceRes.status === 'fulfilled') setAnnouncements((announceRes.value.announcements || []).slice(0, 3));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const gradeInfo = (score: number, total: number) => {
    const p = (score / total) * 100;
    return p >= 70 ? { g: 'A', c: 'text-green-600' } : p >= 60 ? { g: 'B', c: 'text-blue-600' } : p >= 50 ? { g: 'C', c: 'text-yellow-600' } : p >= 45 ? { g: 'D', c: 'text-orange-500' } : { g: 'F', c: 'text-red-500' };
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">{greeting}</p><h1 className="text-lg font-bold text-gray-900">{user?.full_name?.split(' ')[0] || 'Student'}</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center overflow-hidden">
          {(user as any)?.avatar_url ? <img src={(user as any).avatar_url} className="w-full h-full object-cover" /> : (user?.full_name?.[0] || 'S')}
        </button>
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
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-600">{enrollments.length}</p><p className="text-xs text-gray-400 mt-0.5">Courses</p></div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-600">{results.filter(r => (r.score / r.total_marks) >= 0.5).length}</p><p className="text-xs text-gray-400 mt-0.5">Passed</p></div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-600">{results.length}</p><p className="text-xs text-gray-400 mt-0.5">Results</p></div>
        </div>

        {announcements.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><Megaphone size={15} className="text-blue-600" /><h2 className="font-semibold text-sm text-gray-900">Announcements</h2></div>
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

        {enrollments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><BookOpen size={15} className="text-blue-600" /><h2 className="font-semibold text-sm text-gray-900">My Courses</h2></div>
              <button onClick={() => router.push('/dashboard/courses')} className="text-xs text-blue-600">See all</button>
            </div>
            {enrollments.slice(0, 4).map(e => (
              <button key={e.id} onClick={() => router.push(`/dashboard/courses/${e.course_id}`)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 text-left active:bg-gray-50">
                <p className="text-sm font-medium text-gray-900">{e.course_title}</p>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><Trophy size={15} className="text-blue-600" /><h2 className="font-semibold text-sm text-gray-900">Recent Results</h2></div>
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

        {enrollments.length === 0 && results.length === 0 && announcements.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No data yet. Your school admin will enroll you in courses.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Bot, label: 'AI Tutor', href: '/dashboard/ai-tutor' },
            { icon: Brain, label: 'Learning Twin', href: '/dashboard/learning-twin' },
            { icon: Briefcase, label: 'Career', href: '/dashboard/career' },
            { icon: Calendar, label: 'Timetable', href: '/dashboard/timetable' },
            { icon: GraduationCap, label: 'Certificates', href: '/dashboard/certificates' },
            { icon: Zap, label: 'Skill Gap', href: '/dashboard/skill-gap' },
            { icon: FlaskConical, label: 'Virtual Labs', href: '/dashboard/virtual-labs' },
            { icon: BookMarked, label: 'Skill Passport', href: '/dashboard/skill-passport' },
            { icon: Presentation, label: 'Join Q&A', href: '/dashboard/class-sessions' },
            { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
          ].map(({ icon: Icon, label, href }) => (
            <button key={label} onClick={() => router.push(href)} className="bg-white border border-gray-200 active:bg-gray-50 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition">
              <Icon size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
