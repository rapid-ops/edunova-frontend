'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Rule { id: number; name: string; trigger_event: string; action_type: string; is_active: boolean; condition_field: string; condition_operator: string; condition_value: string; }
const TRIGGERS = ['quiz_submitted','lesson_completed','course_completed','fee_overdue','attendance_marked'];
const ACTIONS = ['enroll_course','send_notification'];
const OPS = ['lt','lte','gt','eq'];
export default function AutomationsPage() {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState({ name: '', trigger_event: 'quiz_submitted', condition_field: 'score', condition_operator: 'lt', condition_value: '50', action_type: 'send_notification', action_payload: '{"title":"Keep going!","body":"You can do better."}' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/automations/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setRules(d.rules || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const create = async () => { try { const payload = JSON.parse(form.action_payload); await fetch(`${API}/api/automations`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, action_payload: payload, school_id: user.school_id }) }); setShowForm(false); load(); } catch { alert('Invalid JSON in payload'); } };
  const toggle = async (id: number) => { await fetch(`${API}/api/automations/${id}/toggle`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }); load(); };
  const del = async (id: number) => { await fetch(`${API}/api/automations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Automation Rules</h1></div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ New Rule</button>
        </div>
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Rule name" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500 mb-1 block">Trigger</label><select value={form.trigger_event} onChange={e => setForm({ ...form, trigger_event: e.target.value })} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none">{TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Action</label><select value={form.action_type} onChange={e => setForm({ ...form, action_type: e.target.value })} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none">{ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Condition field</label><input value={form.condition_field} onChange={e => setForm({ ...form, condition_field: e.target.value })} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Operator</label><select value={form.condition_operator} onChange={e => setForm({ ...form, condition_operator: e.target.value })} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none">{OPS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Value</label><input value={form.condition_value} onChange={e => setForm({ ...form, condition_value: e.target.value })} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" /></div>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Action payload (JSON)</label><textarea value={form.action_payload} onChange={e => setForm({ ...form, action_payload: e.target.value })} rows={2} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none resize-none font-mono" /></div>
            <div className="flex gap-3"><button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create</button><button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
          </div>
        )}
        <div className="space-y-3">
          {rules.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No rules yet.</div> : rules.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-400 mt-1">IF {r.trigger_event} {r.condition_field} {r.condition_operator} {r.condition_value} → {r.action_type}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggle(r.id)} className={`text-xs px-3 py-1 rounded-full font-medium ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.is_active ? 'Active' : 'Inactive'}</button>
                <button onClick={() => del(r.id)} className="text-red-400 text-sm hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
