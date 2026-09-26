'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Path { id: number; title: string; description: string; courses: { course_id: number; title: string; position: number }[]; }
export default function LearningPathsPage() {
  const router = useRouter();
  const [paths, setPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAdmin = ['school_admin','super_admin'].includes(user.role);
  const load = () => {
    if (!user.school_id) return;
    fetch(`${API}/api/learning-paths/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setPaths(d.paths || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);
  const create = async () => {
    await fetch(`${API}/api/learning-paths`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, school_id: user.school_id }) });
    setForm({ title: '', description: '' }); setShowForm(false); load();
  };
  const del = async (id: number) => { await fetch(`${API}/api/learning-paths/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button>
            <h1 className="text-xl font-bold text-gray-900">Learning Paths</h1>
          </div>
          {isAdmin && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ New Path</button>}
        </div>
        {showForm && isAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Path title" className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none mb-3" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none resize-none mb-3" />
            <div className="flex gap-3">
              <button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
        {paths.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No learning paths yet.</div>
        ) : (
          <div className="space-y-4">
            {paths.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="font-semibold text-gray-900">{p.title}</h2>
                    {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
                  </div>
                  {isAdmin && <button onClick={() => del(p.id)} className="text-red-400 text-sm hover:text-red-600">Delete</button>}
                </div>
                <div className="mt-3 space-y-2">
                  {(p.courses || []).filter(Boolean).map((c, i) => (
                    <div key={c.course_id} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-gray-700">{c.title}</span>
                    </div>
                  ))}
                  {(!p.courses || p.courses.filter(Boolean).length === 0) && <p className="text-xs text-gray-400">No courses added yet.</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
