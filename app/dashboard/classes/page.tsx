'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Class {
  id: number;
  name: string;
  grade_level: string;
  school_id: number;
}

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Class | null>(null);
  const [form, setForm] = useState({ name: '', grade_level: '', school_id: '1' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes/school/1');
      setClasses(res.data.classes);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/classes/${editing.id}`, form);
        setEditing(null);
      } else {
        await api.post('/classes', form);
      }
      setShowForm(false);
      setForm({ name: '', grade_level: '', school_id: '1' });
      fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed');
    }
  };

  const handleEdit = (c: Class) => {
    setEditing(c);
    setForm({ name: c.name, grade_level: c.grade_level, school_id: String(c.school_id) });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
    } catch (err) {}
  };

  const grouped = classes.reduce((acc: any, c) => {
    const key = c.grade_level || 'Ungrouped';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-xl font-bold">Classes</h1>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ name: '', grade_level: '', school_id: '1' }); setShowForm(!showForm); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          + Add Class
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="font-semibold">{editing ? 'Edit Class' : 'New Class'}</h2>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Class Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. JSS1A, SS2 Science"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Grade Level</label>
              <input
                value={form.grade_level}
                onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                placeholder="e.g. JSS1, SS2, Grade 5"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : classes.length === 0 ? (
          <p className="text-gray-400">No classes yet. Add one above.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([grade, items]: any) => (
              <div key={grade}>
                <h2 className="text-gray-500 text-sm font-medium mb-3">{grade}</h2>
                <div className="space-y-2">
                  {items.map((c: Class) => (
                    <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between">
                      <p className="font-medium">{c.name}</p>
                      <div className="flex gap-4">
                        <button onClick={() => handleEdit(c)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                      </div>
                    </div>
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
