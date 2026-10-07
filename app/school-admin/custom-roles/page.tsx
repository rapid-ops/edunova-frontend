'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';

const ALL_PERMISSIONS = ['view_students','edit_students','delete_students','view_courses','edit_courses','delete_courses','view_fees','edit_fees','view_reports','manage_timetable','view_attendance','edit_attendance','manage_users','view_audit_logs','manage_coupons','manage_tickets'];
interface Role { id: number; name: string; permissions: string[]; }

export default function CustomRolesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState({ name: '', permissions: [] as string[] });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.school_id) return;
    try {
      const r = await api.get(`/custom-roles/${user.school_id}`);
      setRoles(r.data.roles || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const togglePerm = (p: string) => setForm(f => ({
    ...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p]
  }));

  const create = async () => {
    if (!form.name.trim()) return;
    try {
      await api.post('/custom-roles', { ...form, school_id: user?.school_id });
      setForm({ name: '', permissions: [] }); setShowForm(false); load();
    } catch {}
  };

  const del = async (id: number) => {
    if (!confirm('Delete this role?')) return;
    try { await api.delete(`/custom-roles/${id}`); load(); } catch {}
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-sm text-blue-600">← Back</button>
          <h1 className="text-lg font-bold text-gray-900">Custom Roles</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New</button>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Role name" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <div>
              <p className="text-xs text-gray-500 mb-2">Permissions</p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePerm(p)} className="accent-blue-600 w-4 h-4" />
                    <span className="text-gray-700">{p.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Create</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}

        {roles.length === 0
          ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">No custom roles yet.</div>
          : roles.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-gray-900">{r.name}</p>
                <button onClick={() => del(r.id)} className="text-red-400 text-sm">Delete</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.permissions.map((p: string) => (
                  <span key={p} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{p.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
