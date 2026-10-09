'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, CalendarDays } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';
const TYPES = ['term','holiday','exam'] as const;
const TYPE_COLORS: Record<string,string> = { term:'bg-blue-100 text-blue-700', holiday:'bg-green-100 text-green-700', exam:'bg-red-100 text-red-700' };
const blank = { title:'', start_date:'', end_date:'', type:'term', color:'#2563eb' };

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const h = { Authorization: `Bearer ${token}` };

  const load = () => {
    fetch(`${API}/calendars/school/${user.school_id}`, { headers: h })
      .then(r => r.json()).then(d => { setEvents(d.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.start_date || !form.end_date) return;
    setSaving(true); setError('');
    const res = await fetch(`${API}/calendars`, {
      method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error || 'Failed'); setSaving(false); return; }
    setShowForm(false); setForm({ ...blank }); load();
    setSaving(false);
  };

  const del = async (id: number) => {
    await fetch(`${API}/calendars/${id}`, { method: 'DELETE', headers: h });
    load();
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
          <h1 className="text-lg font-bold">Academic Calendar</h1>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
          <Plus size={14} />Add
        </button>
      </div>
      <div className="px-4 py-4 space-y-4">
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <input value={form.title} onChange={e => setForm({...form, title:e.target.value})}
              placeholder="Event title" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Start date</label>
                <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date:e.target.value})}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">End date</label>
                <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date:e.target.value})}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}
                className="bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none">
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <input type="color" value={form.color} onChange={e => setForm({...form, color:e.target.value})}
                  className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer" />
                <span className="text-xs text-gray-500">{form.color}</span>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button onClick={save} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Event'}
              </button>
              <button onClick={() => { setShowForm(false); setError(''); }} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
        {events.length === 0 && !showForm ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <CalendarDays size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No calendar events yet.</p>
          </div>
        ) : events.map(ev => (
          <div key={ev.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: ev.color }} />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{ev.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(ev.start_date).toLocaleDateString('en-NG')} — {new Date(ev.end_date).toLocaleDateString('en-NG')}
                  </p>
                  <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[ev.type] || 'bg-gray-100 text-gray-600'}`}>
                    {ev.type}
                  </span>
                </div>
              </div>
              <button onClick={() => del(ev.id)} className="text-red-400 p-1">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
