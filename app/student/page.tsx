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
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
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
      const [enrollRes, feesRes, notifRes, resultsRes] = await Promise.all([
        api.get(`/enrollments/student/${user?.id}`),
        api.get(`/fees/student/${user?.id}`),
        api.get(`/notifications/${user?.id}`),
        api.get(`/results/student/${user?.id}`),
      ]);
      setEnrollments(enrollRes.data.enrollments);
      setFees(feesRes.data.fees.filter((f: any) => f.status !== 'paid'));
      setNotifications(notifRes.data.notifications.filter((n: any) => !n.is_read));
      setResults(resultsRes.data.results);
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
          <h1 className="text-xl font-bold">Student Portal</h1>
          <p className="text-gray-500 text-xs">Edunova</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.full_name}</span>
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

        {fees.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
            <p className="text-yellow-400 font-medium text-sm">{fees.length} pending fee(s)</p>
            {fees.map((f) => (
              <p key={f.id} className="text-gray-300 text-sm py-1">₦{Number(f.amount).toLocaleString()} — {f.description}</p>
            ))}
          </div>
        )}

        <p className="text-gray-400 mb-6">Welcome, <span className="text-white font-medium">{user?.full_name}</span></p>

        <h2 className="font-semibold mb-3">My Courses</h2>
        {enrollments.length === 0 ? (
          <p className="text-gray-500 text-sm mb-6">Not enrolled in any courses yet.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {enrollments.map((e) => (
              <div
                key={e.id}
                onClick={() => router.push(`/dashboard/courses/${e.course_id}`)}
                className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 cursor-pointer transition"
              >
                <h3 className="font-medium">{e.course_title}</h3>
                <p className="text-gray-500 text-xs mt-1">Enrolled {new Date(e.enrolled_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <>
            <h2 className="font-semibold mb-3">My Results</h2>
            <div className="space-y-3 mb-6">
              {results.map((r) => {
                const { grade, color } = getGrade(r.score, r.total_marks);
                return (
                  <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{r.assessment_title}</p>
                      <p className="text-gray-500 text-xs capitalize mt-1">{r.type}</p>
                      {r.feedback && <p className="text-gray-400 text-sm mt-1">{r.feedback}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{r.score}/{r.total_marks}</p>
                      <p className={`text-2xl font-bold ${color}`}>{grade}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'My Attendance', href: '/dashboard/attendance' },
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
