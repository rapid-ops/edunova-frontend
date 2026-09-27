'use client';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom, getSocket } from '@/lib/socket';
import api from '@/lib/api';
import { Bell, Trophy, ClipboardList, Calendar, MessageCircle, ChevronRight, DollarSign, BookOpen, AlertTriangle } from 'lucide-react';

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [childData, setChildData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
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
      const [childrenRes, notifRes] = await Promise.all([
        api.get(`/parent/children/${user?.id}`),
        api.get(`/notifications/${user?.id}`),
      ]);
      const kids = childrenRes.data.children || [];
      setChildren(kids);
      setNotifications((notifRes.data.notifications || []).filter((n: any) => !n.is_read));
      if (kids.length > 0) await loadChild(kids[0]);
    } catch (err) {}
    setLoading(false);
  };

  const loadChild = async (child: any) => {
    setSelected(child);
    try {
      const [childRes, announceRes] = await Promise.all([
        api.get(`/parent/child/${child.id}`),
        api.get(`/announcements/student/${child.id}/${user?.school_id}`).catch(() => ({ data: { announcements: [] } })),
      ]);
      setChildData(childRes.data);
      setAnnouncements((announceRes.data.announcements || []).slice(0, 3));
    } catch (err) {}
  };

  const gradeInfo = (score: number, total: number) => {
    const p = (score / total) * 100;
    return p >= 70 ? { g: 'A', c: 'text-green-600' } : p >= 60 ? { g: 'B', c: 'text-blue-600' } : p >= 50 ? { g: 'C', c: 'text-yellow-600' } : p >= 45 ? { g: 'D', c: 'text-orange-500' } : { g: 'F', c: 'text-red-500' };
  };

  const totalDays = (childData?.attendance?.present || 0) + (childData?.attendance?.absent || 0) + (childData?.attendance?.late || 0);
  const attendancePct = totalDays > 0 ? Math.round((childData?.attendance?.present / totalDays) * 100) : 0;
  const pendingFees = childData?.fees?.filter((f: any) => f.status !== 'paid') || [];

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">Parent Portal</p><h1 className="text-lg font-bold text-gray-900">{user?.full_name?.split(' ')[0]}</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {notifications.length > 0 && (
          <button onClick={() => router.push('/dashboard/notifications')} className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-left">
            <Bell size={18} className="text-blue-600 shrink-0" />
            <p className="text-blue-600 font-medium text-sm flex-1">{notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
            <ChevronRight size={16} className="text-blue-400 shrink-0" />
          </button>
        )}

        {children.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><p className="text-gray-400 text-sm">No children linked yet. Contact school admin.</p></div>
        ) : (
          <>
            {children.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {children.map(c => (
                  <button key={c.id} onClick={() => loadChild(c)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${selected?.id === c.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{c.full_name.split(' ')[0]}</button>
                ))}
              </div>
            )}

            {selected && childData && (
              <>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center shrink-0">{selected.full_name?.[0]}</div>
                  <div><p className="font-semibold text-gray-900">{selected.full_name}</p><p className="text-xs text-gray-400">{selected.email}</p></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-600">{childData.attendance?.present || 0}</p><p className="text-xs text-gray-400 mt-0.5">Present</p></div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-red-500">{childData.attendance?.absent || 0}</p><p className="text-xs text-gray-400 mt-0.5">Absent</p></div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-600">{attendancePct}%</p><p className="text-xs text-gray-400 mt-0.5">Rate</p></div>
                </div>

                {pendingFees.length > 0 && (
                  <button onClick={() => router.push('/payment')} className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-yellow-600" /><p className="text-yellow-700 font-semibold text-sm">Pending School Fees</p></div>
                    {pendingFees.map((f: any) => (
                      <div key={f.id} className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-700">{f.description}</p>
                        <p className="text-sm font-bold text-gray-900">₦{Number(f.amount).toLocaleString()}</p>
                      </div>
                    ))}
                    <div className="flex items-center gap-1 mt-2"><span className="text-xs text-yellow-600 font-medium">Tap to pay</span><ChevronRight size={12} className="text-yellow-600" /></div>
                  </button>
                )}

                {childData.results?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100"><Trophy size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">Academic Results</h2></div>
                    {childData.results.slice(0, 5).map((r: any) => {
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

                {childData.enrollments?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100"><BookOpen size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">Enrolled Courses</h2></div>
                    {childData.enrollments.map((e: any) => (
                      <div key={e.id} className="px-4 py-3 border-b border-gray-50 last:border-0"><p className="text-sm text-gray-900">{e.course_title}</p></div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {announcements.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2"><Bell size={15} className="text-gray-400" /><h2 className="font-semibold text-sm text-gray-900">School Notices</h2></div>
              <button onClick={() => router.push('/dashboard/announcements')} className="text-xs text-blue-600">See all</button>
            </div>
            {announcements.map(a => (
              <div key={a.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: MessageCircle, label: 'Message School', href: '/dashboard/messages', color: 'text-blue-600' },
            { icon: DollarSign, label: 'Pay Fees', href: '/payment', color: 'text-green-600' },
            { icon: Calendar, label: 'Timetable', href: '/dashboard/timetable', color: 'text-orange-500' },
            { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', color: 'text-purple-600' },
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
