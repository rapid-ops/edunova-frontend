'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle, XCircle, Send } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

export default function TeacherAttendancePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/classs/school/${user.school_id}`, { headers: h })
      .then(r => r.json()).then(d => { setClasses(d.classes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!classId) return;
    setStudents([]); setStatuses({});
    fetch(`${API}/classs/${classId}/students`, { headers: h })
      .then(r => r.json()).then(d => {
        const sts = d.students || [];
        setStudents(sts);
        const initial: Record<number, string> = {};
        sts.forEach((s: any) => { initial[s.id] = 'present'; });
        setStatuses(initial);
      });
  }, [classId]);

  const toggle = (id: number) =>
    setStatuses(p => ({ ...p, [id]: p[id] === 'present' ? 'absent' : 'present' }));

  const submit = async () => {
    if (!classId || !date || !students.length) return;
    setSubmitting(true); setError('');
    const records = students.map(s => ({ student_id: s.id, status: statuses[s.id] || 'present' }));
    try {
      const res = await fetch(`${API}/attendances/bulk`, {
        method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: Number(classId), date, records }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Failed'); } else { setDone(true); }
    } catch { setError('Network error'); }
    setSubmitting(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
        <h1 className="text-lg font-bold">Mark Attendance</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-700">Attendance submitted</p>
            <button onClick={() => { setDone(false); setStatuses({}); }}
              className="mt-4 text-sm text-blue-600">Mark another</button>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <select value={classId} onChange={e => setClassId(e.target.value)}
                className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            {students.length > 0 && (
              <>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between">
                    <span className="text-sm font-semibold">{students.length} students</span>
                    <span className="text-xs text-gray-400">
                      {Object.values(statuses).filter(s => s === 'absent').length} absent
                    </span>
                  </div>
                  {students.map(s => (
                    <button key={s.id} onClick={() => toggle(s.id)}
                      className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                      <span className="text-sm font-medium text-gray-900">{s.full_name}</span>
                      {statuses[s.id] === 'present'
                        ? <CheckCircle size={20} className="text-green-500" />
                        : <XCircle size={20} className="text-red-500" />}
                    </button>
                  ))}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={submit} disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send size={16} />{submitting ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </>
            )}
            {classId && students.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">No students in this class yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
