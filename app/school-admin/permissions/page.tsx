'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const ALL_PERMISSIONS = [
  'view_students','edit_students','delete_students',
  'view_courses','edit_courses','delete_courses',
  'view_fees','edit_fees',
  'view_reports','manage_timetable',
  'view_attendance','edit_attendance',
  'manage_users','view_audit_logs',
  'manage_coupons','manage_tickets',
];

export default function PermissionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [roles, setRoles] = useState<any[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
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

  const togglePerm = (roleId: number, perm: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const perms: string[] = r.permissions || [];
      return {
        ...r,
        permissions: perms.includes(perm) ? perms.filter((p: string) => p !== perm) : [...perms, perm],
        _dirty: true,
      };
    }));
  };

  const save = async (role: any) => {
    setSaving(role.id);
    try {
      await api.put(`/custom-roles/${role.id}`, { name: role.name, permissions: role.permissions });
      setRoles(prev => prev.map(r => r.id === role.id ? { ...r, _dirty: false } : r));
    } catch {}
    setSaving(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm text-blue-600">← Back</button>
        <h1 className="text-lg font-bold text-gray-900">Permissions Matrix</h1>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        {loading ? <p className="text-center text-gray-400 py-12">Loading...</p> :
          roles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
              No custom roles yet. Create roles first.
            </div>
          ) : roles.map(role => (
            <div key={role.id} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-900">{role.name}</p>
                {role._dirty && (
                  <button onClick={() => save(role)} disabled={saving === role.id}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                    {saving === role.id ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox"
                      checked={(role.permissions || []).includes(p)}
                      onChange={() => togglePerm(role.id, p)}
                      className="accent-blue-600 w-4 h-4" />
                    <span className="text-gray-700">{p.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
