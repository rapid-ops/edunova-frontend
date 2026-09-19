'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AttendanceRecord {
  id: number;
  full_name: string;
  student_id: number;
  date: string;
  status: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [marking, setMarking] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (classId && date) fetchRecords();
  }, [classId, date]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/auth/users/1');
      const s = res.data.users.filter((u: any) => u.role === 'student');
      setStudents(s);
      const initial: Record<number, string> = {};
      s.forEach((u: any) => { initial[u.id] = 'present'; });
      setMarking(initial);
    } catch (err) {}
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/class/${classId}?date=${date}`);
      setRecords(res.data.records);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        students.map((s) =>
          api.post('/attendance', {
            school_id: 1,
            student_id: s.id,
            class_id: classId,
            date,
            status: marking[s.id] || 'present',
          })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchRecords();
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-xl font-bold">Attendance</h1>
        </div>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="text-gray-400 text-sm mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-400 text-sm mb-1 block">Class ID</label>
            <input
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {students.length === 0 ? (
          <p className="text-gray-400">No students found. Add students first.</p>
        ) : (
          <div className="space-y-3">
            {students.map((s) => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.full_name}</p>
                  <p className="text-gray-400 text-sm">{s.email}</p>
                </div>
                <div className="flex gap-2">
                  {['present', 'absent', 'late'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setMarking({ ...marking, [s.id]: status })}
                      className={`text-xs px-3 py-1 rounded-full transition ${
                        marking[s.id] === status
                          ? status === 'present' ? 'bg-green-600 text-white'
                          : status === 'absent' ? 'bg-red-600 text-white'
                          : 'bg-yellow-600 text-white'
                          : 'bg-gray-800 text-gray-400'
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
