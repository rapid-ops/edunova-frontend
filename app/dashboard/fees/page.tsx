'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Fee {
  id: number;
  full_name: string;
  student_id: number;
  amount: number;
  description: string;
  status: string;
  due_date: string;
}

export default function FeesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.school_id || 1;
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: '', amount: '', description: '', due_date: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [feesRes, usersRes] = await Promise.all([
        api.get(`/fees/school/${schoolId}`),
        api.get(`/auth/users/${schoolId}`),
      ]);
      setFees(feesRes.data.fees);
      setStudents(usersRes.data.users.filter((u: any) => u.role === 'student'));
    } catch (err) {} finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/fees', { ...form, school_id: schoolId });
      setShowForm(false);
      setForm({ student_id: '', amount: '', description: '', due_date: '' });
      fetchData();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed'); }
  };

  const updateStatus = async (id: number, status: string) => {
    try { await api.patch(`/fees/${id}/status`, { status }); fetchData(); } catch (err) {}
  };

  const statusColor = (status: string) => {
    if (status === 'paid') return 'bg-green-500/10 text-green-400';
    if (status === 'overdue') return 'bg-red-500/10 text-red-400';
    return 'bg-yellow-500/10 text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-xl font-bold">Fees</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">+ Add Fee</button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="font-semibold">New Fee</h2>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Student</label>
              <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none" required>
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Amount (₦)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50000" className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="First term school fees" className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Due Date</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {loading ? <p className="text-gray-400">Loading...</p> : fees.length === 0 ? (
          <p className="text-gray-400">No fees yet.</p>
        ) : (
          <div className="space-y-3">
            {fees.map((f) => (
              <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{f.full_name}</h3>
                    <p className="text-gray-400 text-sm">{f.description}</p>
                    <p className="text-white font-medium mt-1">₦{Number(f.amount).toLocaleString()}</p>
                    {f.due_date && <p className="text-gray-500 text-xs mt-1">Due: {new Date(f.due_date).toLocaleDateString()}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor(f.status)}`}>{f.status}</span>
                </div>
                {f.status !== 'paid' && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => updateStatus(f.id, 'paid')} className="text-green-400 text-sm">Mark Paid</button>
                    <button onClick={() => updateStatus(f.id, 'overdue')} className="text-red-400 text-sm">Mark Overdue</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
