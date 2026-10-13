'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const PERMS = ['view_students','edit_students','delete_students','view_courses','edit_courses','delete_courses','view_fees','edit_fees','view_reports','manage_timetable','view_attendance','edit_attendance','manage_users','view_audit_logs','manage_coupons','manage_tickets'];
interface Role { id: number; name: string; permissions: string[] | null; }
const errMsg = (e: any) => e?.response?.data?.error || e?.message || 'Request failed';

export default function CustomRolesManager() {
  const { user } = useAuthStore();
  const sid = user?.school_id;
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState({ name: '', permissions: [] as string[] });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!sid) { setLoading(false); return; }
    try { const r = await api.get(`/custom-roles/${sid}`); setRoles(r.data.roles || []); }
    catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  }, [sid]);
  useEffect(() => { if (user) load(); }, [user, load]);

  const toggle = (p: string) => setForm((f) => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p] }));

  const create = async () => {
    if (!form.name.trim()) { setNameErr('Role name is required'); return; }
    setBusy(true); setError(''); setNameErr('');
    try {
      await api.post('/custom-roles', { name: form.name.trim(), permissions: form.permissions, school_id: sid });
      setForm({ name: '', permissions: [] }); setShow(false); await load();
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };

  const del = async (id: number) => {
    setBusy(true); setError('');
    try { await api.delete(`/custom-roles/${id}`); await load(); }
    catch (e) { setError(errMsg(e)); } finally { setConfirmId(null); setBusy(false); }
  };

  if (loading) return <p className="text-center text-gray-400 text-sm py-12">Loading...</p>;
  if (!sid) return <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">No school is linked to this account.</div>;

  return (
    <div className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <button onClick={() => { setShow(true); setNameErr(''); }} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium">+ New role</button>
      {show && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div>
            <input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setNameErr(''); }}
              placeholder="Role name" className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none" />
            {nameErr && <p className="text-red-600 text-xs mt-1">{nameErr}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PERMS.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => toggle(p)} className="accent-blue-600 w-4 h-4" />{p.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={create} disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{busy ? 'Creating...' : 'Create'}</button>
            <button onClick={() => setShow(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}
      {roles.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">No custom roles yet.</div>
        : roles.map((r) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-gray-900">{r.name}</p>
              {confirmId === r.id ? (
                <span className="text-sm flex items-center gap-3">
                  <span className="text-gray-600">Delete?</span>
                  <button onClick={() => del(r.id)} disabled={busy} className="text-red-600 font-medium">Yes</button>
                  <button onClick={() => setConfirmId(null)} className="text-gray-500">No</button>
                </span>
              ) : <button onClick={() => setConfirmId(r.id)} className="text-red-500 text-sm">Delete</button>}
            </div>
            <div className="flex flex-wrap gap-2">
              {(r.permissions || []).map((p) => <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{p.replace(/_/g, ' ')}</span>)}
            </div>
          </div>
        ))}
    </div>
  );
}
