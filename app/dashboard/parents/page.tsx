'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ParentsPage() {
  const router = useRouter();
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({ parent_id: '', student_id: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users/1');
      setParents(res.data.users.filter((u: any) => u.role === 'parent'));
      setStudents(res.data.users.filter((u: any) => u.role === 'student'));
    } catch (err) {}
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/parent/link', form);
      setSuccess('Parent linked to student successfully');
      setForm({ parent_id: '', student_id: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to link');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-900">←</button>
        <h1 className="text-xl font-bold">Parent Management</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleLink} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Link Parent to Student</h2>
          <div>
            <label className="text-gray-500 text-sm mb-1 block">Parent</label>
            <select
              value={form.parent_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
              required
            >
              <option value="">Select parent</option>
              {parents.map((p) => <option key={p.id} value={p.id}>{p.full_name} — {p.email}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1 block">Student</label>
            <select
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
              required
            >
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} — {s.email}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-gray-900 py-3 rounded-lg text-sm font-medium">
            Link Parent to Student
          </button>
        </form>

        {parents.length === 0 && (
          <p className="text-gray-500 text-sm mt-6">No parents registered yet. Add parents from Manage Students page.</p>
        )}
      </div>
    </div>
  );
}
