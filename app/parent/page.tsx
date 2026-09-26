'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom, getSocket } from '@/lib/socket';
import api from '@/lib/api';

export default function ParentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
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
      const [childrenRes, notifRes, announceRes] = await Promise.all([
        api.get(`/parent/children/${user?.id}`),
        api.get(`/notifications/${user?.id}`),
        api.get(`/announcements/student/${user?.id}/${user?.school_id}`).catch(() => ({ data: { announcements: [] } })),
      ]);
      const kids = childrenRes.data.children || [];
      setChildren(kids);
      setNotifications((notifRes.data.notifications || []).filter((n: any) => !n.is_read));
      setAnnouncements((announceRes.data.announcements || []).slice(0, 3));
      if (kids.length > 0) await selectChild(kids[0]);
    } catch (err) {}
    setLoading(false);
  };

  const selectChild = async (child: any) => {
    setSelected(child);
    try {
      const res = await api.get(`/parent/child/${child.id}`);
      setChildData(res.data);
    } catch (err) {}
  };

  const gradeInfo = (score: number, total: number) => {
    const p = (score / total) * 100;
    return p >= 70 ? { g: 'A', c: 'text-green-600' } : p >= 60 ? { g: 'B', c: 'text-blue-600' } : p >= 50 ? { g: 'C', c: 'text-yellow-600' } : p >= 45 ? { g: 'D', c: 'text-orange-500' } : { g: 'F', c: 'text-red-500' };
  };

  const attendancePct = childData ? Math.round(((childData.attendance?.present || 0) / Math.max((childData.attendance?.present || 0) + (childData.attendance?.absent || 0) + (childData.attendance?.late || 0), 1)) * 100) : 0;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">Parent Portal</p><h1 className="text-lg font-bold text-gray-900">{user?.full_name?.split(' ')[0]} 👋</h1></div>
        <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">{user?.full_name?.[0]}</button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {notifications.length > 0 && (
          <div onClick={() => router.push('/dashboard/notifications')} className="bg-blue-50 border border-blue-200 rounded-xl p-4 cursor-pointer">
            <p className="text-blue-600 font-medium text-sm">🔔 {notifications.length} new notification{notifications.length > 1 ? 's' : ''}</p>
          </div>
        )}

        {children.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><p className="text-gray-400 text-sm">No children linked yet. Contact school admin.</p></div>
        ) : (
          <>
            {children.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {children.map(c => (
                  <button key={c.id} onClick={() => selectChild(c)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${selected?.id === c.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{c.full_name.split(' ')[0]}</button>
                ))}
              </div>
            )}

            {selected && childData && (
              <>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center">{selected.full_name?.[0]}</div>
                  <div><p className="font-semibold text-gray-900">{selected.full_name}</p><p className="text-xs text-gray-400">{selected.email}</p></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-green-600">{childData.attendance?.present || 0}</div><div className="text-xs text-gray-400 mt-0.5">Present</div></div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-red-500">{childData.attendance?.absent || 0}</div><div className="text-xs text-gray-400 mt-0.5">Absent</div></div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-blue-600">{attendancePct}%</div><div className="text-xs text-gray-400 mt-0.5">Rate</div></div>
                </div>

                {childData.results?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100"><h2 className="font-semibold text-sm text-gray-900">📊 Academic Results</h2></div>
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

                {childData.fees?.filter((f: any) => f.status !== 'paid').length > 0 && (
                  <div onClick={() => router.push('/payment')} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 cursor-pointer">
                    <p className="text-yellow-700 font-semibold text-sm">⚠️ Pending Fees</p>
                    {childData.fees.filter((f: any) => f.status !== 'paid').map((f: any) => (
                      <div key={f.id} className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-700">{f.description}</p>
                        <p className="text-sm font-bold text-gray-900">₦{Number(f.amount).toLocaleString()}</p>
                      </div>
                    ))}
                    <p className="text-xs text-yellow-600 mt-2">Tap to pay →</p>
                  </div>
                )}

                {childData.enrollments?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100"><h2 className="font-semibold text-sm text-gray-900">📚 Enrolled Courses</h2></div>
                    {childData.enrollments.map((e: any) => (
                      <div key={e.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                        <p className="text-sm text-gray-900">{e.course_title}</p>
                      </div>
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
              <h2 className="font-semibold text-sm text-gray-900">📢 School Notices</h2>
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

        <button onClick={() => router.push('/dashboard/messages')} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium">💬 Message School</button>
      </div>
    </div>
  );
}
