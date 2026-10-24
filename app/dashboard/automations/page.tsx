'use client';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Rule { id: number; name: string; trigger_event: string; action_type: string; is_active: boolean; condition_field: string; condition_operator: string; condition_value: string; }
interface Log { id: number; rule_name: string; student_id: number; result: string; created_at: string; }

const TRIGGERS = ['quiz_submitted','lesson_completed','course_completed','fee_overdue','attendance_marked'];
const ACTIONS = ['enroll_course','send_notification','send_whatsapp','send_email','send_parent_notification'];
const OPS = ['lt','lte','gt','eq'];

const emptyForm = { name: '', trigger_event: 'quiz_submitted', condition_field: '', condition_operator: 'lt', condition_value: '', action_type: 'send_notification', payload_title: '', payload_body: '', payload_message: '', payload_subject: '', payload_course_id: '' };

export default function AutomationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.school_id;
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'rules'|'logs'>('rules');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [rulesRes, logsRes, coursesRes] = await Promise.all([
        api.get(`/automations/${schoolId}`),
        api.get(`/automations/${schoolId}/logs`),
        api.get(`/courses/school/${schoolId}`),
      ]);
      setRules(rulesRes.data.rules || []);
      setLogs(logsRes.data.logs || []);
      setCourses(coursesRes.data.courses || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (schoolId) load(); }, [schoolId]);

  const buildPayload = () => {
    if (form.action_type === 'enroll_course') return { course_id: Number(form.payload_course_id) };
    if (form.action_type === 'send_notification') return { title: form.payload_title, body: form.payload_body };
    if (form.action_type === 'send_whatsapp') return { message: form.payload_message };
    if (form.action_type === 'send_email') return { subject: form.payload_subject, body: form.payload_body };
    if (form.action_type === 'send_parent_notification') return { message: form.payload_message };
    return {};
  };

  const create = async () => {
    try {
      await api.post('/automations', {
        name: form.name, trigger_event: form.trigger_event,
        condition_field: form.condition_field || undefined,
        condition_operator: form.condition_operator,
        condition_value: form.condition_value || undefined,
        action_type: form.action_type,
        action_payload: buildPayload(),
        school_id: schoolId,
      });
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
  };

  const toggle = async (id: number) => { await api.put(`/automations/${id}/toggle`); load(); };
  const del = async (id: number) => { if (!confirm('Delete this rule?')) return; await api.delete(`/automations/${id}`); load(); };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-blue-600 text-sm">← Back</button>
          <h1 className="text-lg font-bold">Automations</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Rule</button>
      </div>

      <div className="flex border-b border-gray-200 bg-white px-4">
        {(['rules','logs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium capitalize border-b-2 ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>{t}</button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Rule name" className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Trigger</p>
                <select value={form.trigger_event} onChange={e => setForm({...form, trigger_event: e.target.value})} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none">
                  {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Action</p>
                <select value={form.action_type} onChange={e => setForm({...form, action_type: e.target.value})} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none">
                  {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Condition field</p>
                <input value={form.condition_field} onChange={e => setForm({...form, condition_field: e.target.value})} placeholder="e.g. score" className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Operator</p>
                <select value={form.condition_operator} onChange={e => setForm({...form, condition_operator: e.target.value})} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none">
                  {OPS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Value</p>
                <input value={form.condition_value} onChange={e => setForm({...form, condition_value: e.target.value})} placeholder="e.g. 50" className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
            </div>

            {/* Structured payload fields */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Action details</p>
              {form.action_type === 'enroll_course' && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Course</p>
                  <select value={form.payload_course_id} onChange={e => setForm({...form, payload_course_id: e.target.value})} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="">Select course</option>
                    {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              )}
              {(form.action_type === 'send_notification') && (
                <>
                  <input value={form.payload_title} onChange={e => setForm({...form, payload_title: e.target.value})} placeholder="Title" className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" />
                  <textarea value={form.payload_body} onChange={e => setForm({...form, payload_body: e.target.value})} placeholder="Body (optional)" rows={2} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
                </>
              )}
              {(form.action_type === 'send_whatsapp' || form.action_type === 'send_parent_notification') && (
                <textarea value={form.payload_message} onChange={e => setForm({...form, payload_message: e.target.value})} placeholder="Message" rows={2} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
              )}
              {form.action_type === 'send_email' && (
                <>
                  <input value={form.payload_subject} onChange={e => setForm({...form, payload_subject: e.target.value})} placeholder="Subject" className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" />
                  <textarea value={form.payload_body} onChange={e => setForm({...form, payload_body: e.target.value})} placeholder="Body" rows={2} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Create</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}

        {tab === 'rules' && (
          rules.length === 0
            ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">No rules yet.</div>
            : rules.map(r => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">IF {r.trigger_event} {r.condition_field} {r.condition_operator} {r.condition_value} → {r.action_type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(r.id)} className={`text-xs px-3 py-1 rounded-full font-medium ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.is_active ? 'On' : 'Off'}</button>
                  <button onClick={() => del(r.id)} className="text-red-400 text-xs">Delete</button>
                </div>
              </div>
            ))
        )}

        {tab === 'logs' && (
          logs.length === 0
            ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">No logs yet.</div>
            : logs.map(l => (
              <div key={l.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-900">{l.rule_name}</p>
                  <p className="text-xs text-gray-400">{new Date(l.created_at).toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{l.result}</p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
