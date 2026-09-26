'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function FeesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.school_id || 1;
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<'class' | 'student'>('class');
  const [form, setForm] = useState({ class_id: '', student_id: '', amount: '', description: '', due_date: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [feesRes, usersRes, classesRes] = await Promise.all([
        api.get(`/fees/school/${schoolId}`),
        api.get(`/auth/users/${schoolId}`),
        api.get(`/classes/school/${schoolId}`),
      ]);
      setFees(feesRes.data.fees);
      setStudents(usersRes.data.users.filter((u: any) => u.role === 'student'));
      setClasses(classesRes.data.classes);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'class' && form.class_id) {
        // Get all students in this class and create fee for each
        // For now create for all students (class filtering via enrollment coming later)
        await Promise.all(
          students.map((s) =>
            api.post('/fees', {
              school_id: schoolId,
              student_id: s.id,
              amount: form.amount,
              description: `${form.description} (${classes.find(c => String(c.id) === form.class_id)?.name || 'Class'})`,
              due_date: form.due_date,
            })
          )
        );
      } else {
        await api.post('/fees', { school_id: schoolId, student_id: form.student_id, amount: form.amount, description: form.description, due_date: form.due_date });
      }
      setShowForm(false);
      setForm({ class_id: '', student_id: '', amount: '', description: '', due_date: '' });
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">←</button>
          <h1 className="text-xl font-bold">Fees</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-gray-900 text-sm px-4 py-2 rounded-lg">+ Add Fee</button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="font-semibold">New Fee</h2>
            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-2">
              <button type="button" onClick={() => setMode('class')} className={`px-4 py-2 rounded-lg text-sm ${mode === 'class' ? 'bg-blue-600 text-gray-900' : 'bg-gray-100 text-gray-500'}`}>By Class</button>
              <button type="button" onClick={() => setMode('student')} className={`px-4 py-2 rounded-lg text-sm ${mode === 'student' ? 'bg-blue-600 text-gray-900' : 'bg-gray-100 text-gray-500'}`}>By Student</button>
            </div>

            {mode === 'class' ? (
              <div>
                <label className="text-gray-500 text-sm mb-1 block">Class</label>
                <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none" required>
                  <option value="">Select class</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-gray-500 text-sm mb-1 block">Student</label>
                <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none" required>
                  <option value="">Select student</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="text-gray-500 text-sm mb-1 block">Amount (₦)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50000" className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="First term school fees" className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Due Date</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-gray-900 px-6 py-2 rounded-lg text-sm">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {loading ? <p className="text-gray-500">Loading...</p> : fees.length === 0 ? (
          <p className="text-gray-500">No fees yet.</p>
        ) : (
          <div className="space-y-3">
            {fees.map((f) => (
              <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{f.full_name}</h3>
                    <p className="text-gray-500 text-sm">{f.description}</p>
                    <p className="text-gray-900 font-medium mt-1">₦{Number(f.amount).toLocaleString()}</p>
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
