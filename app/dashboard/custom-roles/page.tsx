'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
const ALL_PERMISSIONS = ['view_students','edit_students','delete_students','view_courses','edit_courses','delete_courses','view_fees','edit_fees','view_reports','manage_timetable','view_attendance','edit_attendance','manage_users','view_audit_logs','manage_coupons','manage_tickets'];
interface Role { id: number; name: string; permissions: string[]; }
export default function CustomRolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState({ name: '', permissions: [] as string[] });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/custom-roles/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setRoles(d.roles || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const togglePerm = (p: string) => setForm(f => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p] }));
  const create = async () => { await fetch(`${API}/api/custom-roles`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, school_id: user.school_id }) }); setForm({ name: '', permissions: [] }); setShowForm(false); load(); };
  const del = async (id: number) => { await fetch(`${API}/api/custom-roles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Custom Roles</h1></div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ New Role</button>
        </div>
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Role name" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <div><p className="text-xs text-gray-500 mb-2">Permissions</p><div className="grid grid-cols-2 gap-2">{ALL_PERMISSIONS.map(p => (<label key={p} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePerm(p)} className="accent-blue-600" />{p.replace(/_/g,' ')}</label>))}</div></div>
            <div className="flex gap-3"><button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create</button><button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
          </div>
        )}
        <div className="space-y-3">
          {roles.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No custom roles yet.</div> : roles.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3"><div className="font-medium text-gray-900">{r.name}</div><button onClick={() => del(r.id)} className="text-red-400 text-sm hover:text-red-600">Delete</button></div>
              <div className="flex flex-wrap gap-2">{r.permissions.map((p: string) => <span key={p} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{p.replace(/_/g,' ')}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
