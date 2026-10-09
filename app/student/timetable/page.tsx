'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

export default function StudentTimetablePage() {
  const router = useRouter();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  useEffect(() => {
    fetch(`${API}/timetables/student/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setTimetable(d.timetable||[]); setLoading(false); })
      .catch(()=>setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
        <h1 className="text-lg font-bold">My Timetable</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        {DAYS.map(day => {
          const slots = timetable.filter(t => t.day_of_week === day);
          if (!slots.length) return null;
          return (
            <div key={day} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                <p className="text-sm font-semibold text-blue-700">{day}</p>
              </div>
              {slots.map(s => (
                <div key={s.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                  <p className="text-sm font-medium text-gray-900">{s.course_title}</p>
                  <p className="text-xs text-gray-400">{s.start_time}–{s.end_time}
                    {s.teacher_name && ` · ${s.teacher_name}`}</p>
                </div>
              ))}
            </div>
          );
        })}
        {timetable.length === 0 && <p className="text-center text-gray-400 text-sm py-12">No timetable assigned yet.</p>}
      </div>
    </div>
  );
}
