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
      const [childrenRes, notifRes] = await Promise.all([
        api.get(`/parent/children/${user?.id}`),
        api.get(`/notifications/${user?.id}`),
      ]);
      setChildren(childrenRes.data.children);
      setNotifications(notifRes.data.notifications.filter((n: any) => !n.is_read));
      if (childrenRes.data.children.length > 0) {
        selectChild(childrenRes.data.children[0]);
      }
    } catch (err) {}
  };

  const selectChild = async (child: any) => {
    setSelected(child);
    try {
      const res = await api.get(`/parent/child/${child.id}`);
      setChildData(res.data);
    } catch (err) {}
  };

  const getGrade = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct >= 70) return { grade: 'A', color: 'text-green-400' };
    if (pct >= 60) return { grade: 'B', color: 'text-blue-400' };
    if (pct >= 50) return { grade: 'C', color: 'text-yellow-400' };
    if (pct >= 45) return { grade: 'D', color: 'text-orange-400' };
    return { grade: 'F', color: 'text-red-400' };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Parent Portal</h1>
          <p className="text-gray-500 text-xs">Edunova</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/profile')} className="text-gray-400 text-sm">Profile</button>
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="text-sm text-red-400">Logout</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {notifications.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
            <p className="text-blue-400 font-medium text-sm mb-2">{notifications.length} new notifications</p>
            {notifications.slice(0, 2).map((n) => (
              <p key={n.id} className="text-gray-300 text-sm py-1">{n.title} — {n.body}</p>
            ))}
          </div>
        )}

        {children.length === 0 ? (
          <p className="text-gray-400">No children linked to your account yet. Contact the school admin.</p>
        ) : (
          <>
            {children.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectChild(c)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${selected?.id === c.id ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400'}`}
                  >
                    {c.full_name}
                  </button>
                ))}
              </div>
            )}

            {selected && childData && (
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h2 className="font-semibold text-lg">{selected.full_name}</h2>
                  <p className="text-gray-400 text-sm">{selected.email}</p>
                </div>

                {/* Attendance */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-3">Attendance</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-green-400 text-2xl font-bold">{childData.attendance?.present || 0}</p>
                      <p className="text-gray-500 text-xs">Present</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 text-2xl font-bold">{childData.attendance?.absent || 0}</p>
                      <p className="text-gray-500 text-xs">Absent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-yellow-400 text-2xl font-bold">{childData.attendance?.late || 0}</p>
                      <p className="text-gray-500 text-xs">Late</p>
                    </div>
                  </div>
                </div>

                {/* Results */}
                {childData.results?.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-3">Academic Results</h3>
                    <div className="space-y-3">
                      {childData.results.map((r: any) => {
                        const { grade, color } = getGrade(r.score, r.total_marks);
                        return (
                          <div key={r.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{r.assessment_title}</p>
                              <p className="text-gray-500 text-xs capitalize">{r.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">{r.score}/{r.total_marks}</p>
                              <p className={`text-lg font-bold ${color}`}>{grade}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fees */}
                {childData.fees?.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-3">Fees</h3>
                    <div className="space-y-2">
                      {childData.fees.map((f: any) => (
                        <div key={f.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">{f.description}</p>
                            <p className="text-gray-400 text-sm">₦{Number(f.amount).toLocaleString()}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${f.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            {f.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Courses */}
                {childData.enrollments?.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-3">Enrolled Courses</h3>
                    <div className="space-y-2">
                      {childData.enrollments.map((e: any) => (
                        <p key={e.id} className="text-sm text-gray-300">{e.course_title}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-6">
          <button
            onClick={() => router.push('/dashboard/messages')}
            className="w-full bg-gray-900 border border-gray-800 hover:border-blue-500 text-left px-5 py-4 rounded-xl text-sm font-medium transition"
          >
            Message School →
          </button>
        </div>
      </div>
    </div>
  );
}
