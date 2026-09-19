'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'students' | 'teachers'>('students');
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'student', school_id: '1' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/schools/1');
      const usersRes = await api.get('/auth/users/1');
      const all = usersRes.data.users;
      setStudents(all.filter((u: User) => u.role === 'student'));
      setTeachers(all.filter((u: User) => u.role === 'teacher'));
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      setShowForm(false);
      setForm({ full_name: '', email: '', password: '', role: 'student', school_id: '1' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const list = tab === 'students' ? students : teachers;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-xl font-bold">People</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          + Add
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-2 mb-6">
          {(['students', 'teachers'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="font-semibold">Add {form.role === 'student' ? 'Student' : 'Teacher'}</h2>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              {['student', 'teacher'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`px-4 py-2 rounded-lg text-sm ${form.role === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            {[
              { key: 'full_name', label: 'Full Name', placeholder: 'John Doe', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'john@school.com', type: 'email' },
              { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-gray-400 text-sm mb-1 block">{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-400">No {tab} yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {list.map((u) => (
              <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{u.full_name}</h3>
                  <p className="text-gray-400 text-sm">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
