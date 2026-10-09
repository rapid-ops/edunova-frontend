'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const blank = { class_id:'', course_id:'', teacher_id:'', day_of_week:'Monday', start_time:'08:00', end_time:'09:00' };

export default function AdminTimetablePage() {
  const router = useRouter();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...blank});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const h = { Authorization: `Bearer ${token}` };

  const load = async () => {
    const [tt, cl, co, us] = await Promise.all([
      fetch(`${API}/timetables/school/${user.school_id}`, { headers: h }).then(r=>r.json()),
      fetch(`${API}/classs/school/${user.school_id}`, { headers: h }).then(r=>r.json()),
      fetch(`${API}/courses/school/${user.school_id}`, { headers: h }).then(r=>r.json()),
      fetch(`${API}/auth/users/${user.school_id}`, { headers: h }).then(r=>r.json()),
    ]);
    setTimetable(tt.timetable || []);
    setClasses(cl.classes || []);
    setCourses(co.courses || []);
    setTeachers((us.users || []).filter((u:any) => u.role === 'teacher'));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.class_id || !form.course_id || !form.day_of_week) return;
    setSaving(true); setError('');
    const res = await fetch(`${API}/timetables`, {
      method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, class_id: Number(form.class_id), course_id: Number(form.course_id),
        teacher_id: form.teacher_id ? Number(form.teacher_id) : null }),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error||'Failed'); setSaving(false); return; }
    setShowForm(false); setForm({...blank}); load(); setSaving(false);
  };

  const del = async (id: number) => {
    await fetch(`${API}/timetables/${id}`, { method:'DELETE', headers: h });
    load();
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
          <h1 className="text-lg font-bold">Timetable</h1>
        </div>
        <button onClick={() => setShowForm(s=>!s)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
          <Plus size={14} />Add
        </button>
      </div>
      <div className="px-4 py-4 space-y-4">
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <select value={form.class_id} onChange={e=>setForm({...form,class_id:e.target.value})}
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
              <option value="">Select class</option>
              {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.course_id} onChange={e=>setForm({...form,course_id:e.target.value})}
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
              <option value="">Select course</option>
              {courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <select value={form.teacher_id} onChange={e=>setForm({...form,teacher_id:e.target.value})}
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
              <option value="">Select teacher (optional)</option>
              {teachers.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
            <select value={form.day_of_week} onChange={e=>setForm({...form,day_of_week:e.target.value})}
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
              {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Start</label>
                <input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">End</label>
                <input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button onClick={add} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Entry'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
        {DAYS.map(day => {
          const slots = timetable.filter(t => t.day_of_week === day);
          if (!slots.length) return null;
          return (
            <div key={day} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">{day}</p>
              </div>
              {slots.map(s => (
                <div key={s.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.course_title}</p>
                    <p className="text-xs text-gray-400">{s.class_name} · {s.start_time}–{s.end_time}
                      {s.teacher_name && ` · ${s.teacher_name}`}</p>
                  </div>
                  <button onClick={() => del(s.id)} className="text-red-400 p-1"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          );
        })}
        {timetable.length === 0 && !showForm && (
          <p className="text-center text-gray-400 text-sm py-12">No timetable entries yet.</p>
        )}
      </div>
    </div>
  );
}
