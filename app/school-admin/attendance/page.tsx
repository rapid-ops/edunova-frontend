'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

export default function AdminAttendancePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  useEffect(() => {
    fetch(`${API}/attendances/analytics/${user.school_id}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (!data) return <div className="p-6 text-gray-400 text-center">Could not load analytics.</div>;

  const overall = data.overall || {};
  const perClass: any[] = data.per_class || [];
  const perStudent: any[] = data.per_student || [];
  const lowStudents = perStudent.filter(s => Number(s.rate) < 75);

  const rate = (n: any) => `${Number(n || 0).toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
        <h1 className="text-lg font-bold">Attendance Analytics</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{rate(overall.rate)}</p>
            <p className="text-xs text-gray-400 mt-1">Overall</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{overall.present || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Present</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{lowStudents.length}</p>
            <p className="text-xs text-gray-400 mt-1">Below 75%</p>
          </div>
        </div>

        {/* Per-class table */}
        {perClass.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp size={15} className="text-gray-400" />
              <h2 className="text-sm font-semibold">By Class</h2>
            </div>
            {perClass.map(c => (
              <div key={c.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                <span className="text-sm text-gray-900">{c.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, Number(c.rate || 0))}%` }} />
                  </div>
                  <span className={`text-sm font-medium ${Number(c.rate) < 75 ? 'text-red-500' : 'text-gray-700'}`}>
                    {rate(c.rate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Students below 75% */}
        {lowStudents.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" />
              <h2 className="text-sm font-semibold text-red-600">Students Below 75%</h2>
            </div>
            {lowStudents.map(s => (
              <div key={s.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.full_name}</p>
                  <p className="text-xs text-gray-400">{s.present}/{s.total} days present</p>
                </div>
                <span className="text-sm font-bold text-red-500">{rate(s.rate)}</span>
              </div>
            ))}
          </div>
        )}

        {perClass.length === 0 && perStudent.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Users size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No attendance records yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
