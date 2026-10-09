'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, CreditCard, CalendarDays } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [childData, setChildData] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const cr = await api.get('/parents/children');
        const list: any[] = cr.data.children || [];
        setChildren(list);
        const map: Record<number, any> = {};
        await Promise.all(list.map(async (c: any) => {
          const [att, grades, fees] = await Promise.all([
            api.get(`/attendances/student/${c.id}`).catch(() => ({ data: {} })),
            api.get(`/gradebooks/student/${c.id}`).catch(() => ({ data: { grades: [] } })),
            api.get(`/fees/student/${c.id}`).catch(() => ({ data: { fees: [] } }))
          ]);
          map[c.id] = {
            attendance: att.data.summary || att.data,
            grades: grades.data.grades?.slice(0, 3) || [],
            fees: (fees.data.fees || []).filter((f: any) => !f.paid)
          };
        }));
        setChildData(map);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Parent Dashboard</h1>
      <p className="text-sm text-gray-400 mb-6">Overview of your children's progress</p>

      {!children.length ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
          No linked children found. Contact the school administrator.
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child: any) => {
            const d = childData[child.id] || {};
            return (
              <div key={child.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">{child.full_name}</h2>
                    <p className="text-xs text-gray-400">{child.school_name || 'School'}</p>
                  </div>
                  <button onClick={() => router.push('/parent/children')} className="text-xs text-blue-600 hover:underline">View Details</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <CalendarDays size={14} className="text-blue-600 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{d.attendance?.rate ?? '—'}%</p>
                    <p className="text-xs text-gray-400">Attendance</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <BookOpen size={14} className="text-green-600 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{d.grades?.length ?? 0}</p>
                    <p className="text-xs text-gray-400">Recent Grades</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <CreditCard size={14} className="text-red-500 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{d.fees?.length ?? 0}</p>
                    <p className="text-xs text-gray-400">Unpaid Fees</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <Users size={14} className="text-purple-600 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{child.class_name || '—'}</p>
                    <p className="text-xs text-gray-400">Class</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={() => router.push(`/fees?student=${child.id}`)} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">Pay Fees</button>
                  <button onClick={() => router.push(`/attendance?student=${child.id}`)} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">Attendance</button>
                  <button onClick={() => router.push('/messages')} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">Messages</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
