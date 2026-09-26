'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function AttendancePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.school_id || 1;
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [marking, setMarking] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classId) fetchStudents();
  }, [classId]);

  const fetchClasses = async () => {
    try {
      const res = await api.get(`/classes/school/${schoolId}`);
      setClasses(res.data.classes);
      if (res.data.classes.length > 0) setClassId(String(res.data.classes[0].id));
    } catch (err) {}
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/auth/users/${schoolId}`);
      const s = res.data.users.filter((u: any) => u.role === 'student');
      setStudents(s);
      const initial: Record<number, string> = {};
      s.forEach((u: any) => { initial[u.id] = 'present'; });
      setMarking(initial);
    } catch (err) {}
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all(
        students.map((s) =>
          api.post('/attendance', {
            school_id: schoolId,
            student_id: s.id,
            class_id: classId,
            date,
            status: marking[s.id] || 'present',
          })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">←</button>
          <h1 className="text-xl font-bold">Attendance</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || students.length === 0}
          className="bg-green-600 hover:bg-green-700 text-gray-900 text-sm px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {saved ? 'Saved!' : loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="text-gray-500 text-sm mb-1 block">Class</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
            >
              {classes.length === 0 && <option value="">No classes yet</option>}
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-gray-500 text-sm mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {students.length === 0 ? (
          <p className="text-gray-500">No students found. Add students first.</p>
        ) : (
          <div className="space-y-3">
            {students.map((s) => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.full_name}</p>
                  <p className="text-gray-500 text-sm">{s.email}</p>
                </div>
                <div className="flex gap-2">
                  {['present', 'absent', 'late'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setMarking({ ...marking, [s.id]: status })}
                      className={`text-xs px-3 py-1 rounded-full transition ${
                        marking[s.id] === status
                          ? status === 'present' ? 'bg-green-600 text-gray-900'
                          : status === 'absent' ? 'bg-red-600 text-gray-900'
                          : 'bg-yellow-600 text-gray-900'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
