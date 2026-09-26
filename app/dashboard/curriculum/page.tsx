'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Standard { id: number; name: string; framework: string; description: string; course_count: number; }
const FRAMEWORKS = ['IB','Cambridge','US Common Core','UK National','NGSS','Custom'];
export default function CurriculumPage() {
  const router = useRouter();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [form, setForm] = useState({ name: '', framework: 'IB', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/curriculum/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setStandards(d.standards || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const create = async () => { await fetch(`${API}/api/curriculum`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, school_id: user.school_id }) }); setForm({ name: '', framework: 'IB', description: '' }); setShowForm(false); load(); };
  const del = async (id: number) => { await fetch(`${API}/api/curriculum/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Curriculum Standards</h1></div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ Add Standard</button>
        </div>
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Standard name" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <select value={form.framework} onChange={e => setForm({ ...form, framework: e.target.value })} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none">{FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}</select>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none" />
            <div className="flex gap-3"><button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Save</button><button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {standards.length === 0 ? <div className="p-12 text-center text-gray-400">No standards yet.</div> : standards.map(s => (
            <div key={s.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0">
              <div><div className="font-medium text-gray-900">{s.name}</div><div className="text-xs text-gray-400">{s.framework} · {s.description} · {s.course_count} course{Number(s.course_count) !== 1 ? 's' : ''}</div></div>
              <button onClick={() => del(s.id)} className="text-red-400 text-sm hover:text-red-600">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
