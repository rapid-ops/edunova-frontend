'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ReportCardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [term, setTerm] = useState('First Term 2026');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/auth/users/1');
      setStudents(res.data.users.filter((u: any) => u.role === 'student'));
    } catch (err) {}
  };

  const handleDownload = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:5000/api/reportcard/${selectedStudent}/${encodeURIComponent(term)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-card-${term}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-900">←</button>
        <h1 className="text-xl font-bold">Report Cards</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Generate Report Card</h2>
          <div>
            <label className="text-gray-500 text-sm mb-1 block">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1 block">Term</label>
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. First Term 2026"
            />
          </div>
          <button
            onClick={handleDownload}
            disabled={!selectedStudent || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-gray-900 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Download PDF Report Card'}
          </button>
        </div>
      </div>
    </div>
  );
}
