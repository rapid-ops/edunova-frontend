'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Dept { id: number; name: string; program_count: number; }
export default function DepartmentsPage() {
  const router = useRouter();
  const [deps, setDeps] = useState<Dept[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAdmin = ['school_admin','super_admin'].includes(user.role);
  const load = () => fetch(`${API}/api/departments/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setDeps(d.departments || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const create = async () => { if (!name.trim()) return; await fetch(`${API}/api/departments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ school_id: user.school_id, name }) }); setName(''); load(); };
  const del = async (id: number) => { await fetch(`${API}/api/departments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Departments</h1></div>
        {isAdmin && <div className="flex gap-3 mb-6"><input value={name} onChange={e => setName(e.target.value)} placeholder="Department name" className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /><button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add</button></div>}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {deps.length === 0 ? <div className="p-12 text-center text-gray-400">No departments yet.</div> : deps.map(d => (
            <div key={d.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0">
              <div><div className="font-medium text-gray-900">{d.name}</div><div className="text-xs text-gray-400">{d.program_count} program{Number(d.program_count) !== 1 ? 's' : ''}</div></div>
              {isAdmin && <button onClick={() => del(d.id)} className="text-red-400 text-sm hover:text-red-600">Delete</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
