'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Clock, ExternalLink, Plus, School, Trash2, Users, Video, X } from 'lucide-react';
import api from '@/lib/api';
import { DAYS, byTime, errMsg, inputCls, stateOf, toLocalInput, when } from './util';

const blankSession = { title: '', course_id: '', scheduled_at: '', duration_minutes: '', meeting_url: '' };
const blankSlot = { course_id: '', day_of_week: 'Monday', start_time: '08:00', end_time: '09:00' };

export default function ClassesHub() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [slotForm, setSlotForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDel, setConfirmDel] = useState<string>('');

  const load = useCallback(async () => {
    try { const r = await api.get('/class-hub/mine'); setData(r.data); setError(''); }
    catch (e: any) { setError(errMsg(e)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openSession = (s?: any) => {
    setFormError(''); setNote('');
    setEditId(s ? s.id : null);
    setForm(s
      ? { title: s.title, course_id: String(s.course_id || ''), scheduled_at: toLocalInput(s.scheduled_at), duration_minutes: s.duration_minutes ? String(s.duration_minutes) : '', meeting_url: s.meeting_url || '' }
      : { ...blankSession });
  };
  const openSlot = () => { setFormError(''); setNote(''); setSlotForm({ ...blankSlot }); };

  const saveSession = async () => {
    if (!form) return;
    setFormError('');
    if (!form.title.trim()) { setFormError('Please enter a title.'); return; }
    if (!editId && !form.course_id) { setFormError('Please choose a course.'); return; }
    setSaving(true);
    try {
      const body: any = {
        title: form.title.trim(),
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        duration_minutes: form.duration_minutes || null,
        meeting_url: form.meeting_url.trim() || null,
      };
      if (editId) await api.put(`/class-hub/sessions/${editId}`, body);
      else await api.post('/class-hub/sessions', { ...body, course_id: Number(form.course_id) });
      setForm(null); setEditId(null);
      await load();
    } catch (e: any) { setFormError(errMsg(e)); }
    setSaving(false);
  };

  const saveSlot = async () => {
    if (!slotForm) return;
    setFormError('');
    if (!slotForm.course_id) { setFormError('Please choose a course.'); return; }
    setSaving(true);
    try {
      await api.post('/class-hub/slots', { ...slotForm, course_id: Number(slotForm.course_id) });
      setSlotForm(null);
      await load();
    } catch (e: any) { setFormError(errMsg(e)); }
    setSaving(false);
  };

  const endSession = async (id: number) => {
    setNote('');
    try { await api.put(`/class-sessions/${id}/close`); await load(); setNote('Session ended.'); } catch (e: any) { setNote(errMsg(e)); }
  };
  const removeSession = async (id: number) => {
    setNote('');
    try { await api.delete(`/class-hub/sessions/${id}`); setConfirmDel(''); await load(); setNote('Session deleted.'); } catch (e: any) { setNote(errMsg(e)); }
  };
  const removeSlot = async (id: number) => {
    setNote('');
    try { await api.delete(`/class-hub/slots/${id}`); setConfirmDel(''); await load(); setNote('Lecture time removed.'); } catch (e: any) { setNote(errMsg(e)); }
  };

  if (!data && !error) return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  if (!data) return <div className="p-6 text-sm text-red-600">{error}</div>;

  const classes: any[] = data.classes || [];
  const courses: any[] = data.courses || [];
  const slots: any[] = data.slots || [];
  const sessions: any[] = data.sessions || [];
  const live = sessions.filter((s) => stateOf(s) === 'live');
  const upcoming = sessions.filter((s) => stateOf(s) === 'upcoming').sort(byTime);
  const past = sessions.filter((s) => stateOf(s) === 'past');
  const picked = courses.find((c) => String(c.id) === String(form?.course_id));
  const slotCourses = courses.filter((c) => c.class_id);

  const SessionCard = ({ s }: { s: any }) => {
    const st = stateOf(s);
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{s.title}</p>
            <p className="mt-0.5 text-xs text-gray-500">{[s.course_title, s.class_name].filter(Boolean).join(' - ')}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st === 'live' ? 'bg-green-100 text-green-700' : st === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            {st === 'live' ? 'Open now' : st === 'upcoming' ? 'Upcoming' : 'Ended'}
          </span>
        </div>
        {s.scheduled_at && <p className="mt-2 flex items-center gap-1 text-xs text-gray-600"><Clock size={12} /> {when(s.scheduled_at)}{s.duration_minutes ? ` - ${s.duration_minutes} min` : ''}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {s.meeting_url && st !== 'past' && (
            <a href={s.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white"><Video size={14} /> Open meeting</a>
          )}
          {st !== 'past' && s.code && <span className="rounded-lg bg-gray-100 px-2.5 py-2 text-xs text-gray-600">Q&amp;A code <b className="text-gray-900">{s.code}</b></span>}
          {st !== 'past' && <Link href="/dashboard/class-sessions" className="inline-flex min-h-10 items-center gap-1 px-1 text-sm font-medium text-blue-600">Questions <ExternalLink size={12} /></Link>}
        </div>
        {s.can_manage && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <button onClick={() => openSession(s)} className="min-h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-700">Edit</button>
            {s.is_active && <button onClick={() => endSession(s.id)} className="min-h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-700">End session</button>}
            {confirmDel === `s${s.id}` ? (
              <>
                <button onClick={() => removeSession(s.id)} className="min-h-10 rounded-lg bg-red-600 px-3 text-sm font-medium text-white">Yes, delete</button>
                <button onClick={() => setConfirmDel('')} className="min-h-10 px-2 text-sm text-gray-500">Cancel</button>
              </>
            ) : (
              <button onClick={() => setConfirmDel(`s${s.id}`)} aria-label="Delete session" className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-red-600"><Trash2 size={16} /></button>
            )}
          </div>
        )}
      </div>
    );
  };

  const Group = ({ title, list }: { title: string; list: any[] }) => list.length === 0 ? null : (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      {list.map((s) => <SessionCard key={s.id} s={s} />)}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-5 text-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Classes</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openSlot} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"><CalendarClock size={16} /> Weekly time</button>
          <button onClick={() => openSession()} className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white"><Plus size={16} /> New session</button>
        </div>
      </div>
      {note && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{note}</p>}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Your classes</h2>
        {classes.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-400">You are not linked to any class yet. The school office will add you.</p>}
        {classes.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><School size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{c.name}{c.grade_level ? ` - ${c.grade_level}` : ''}</p>
              <p className="truncate text-xs text-gray-500">{Number(c.teacher_id) === Number(data.me) ? 'You are the class teacher' : c.teacher_name ? `Class teacher: ${c.teacher_name}` : 'No class teacher yet'}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500"><Users size={13} /> {c.student_count}</span>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Weekly lecture times</h2>
        {slots.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-400">No weekly times yet. Tap Weekly time to add one.</p>}
        {DAYS.map((day) => {
          const list = slots.filter((x) => x.day_of_week === day);
          if (!list.length) return null;
          return (
            <div key={day} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <p className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">{day}</p>
              {list.map((x) => (
                <div key={x.id} className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5 last:border-b-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{x.course_title}</p>
                    <p className="truncate text-xs text-gray-500">{x.class_name} - {x.start_time} to {x.end_time}</p>
                  </div>
                  {confirmDel === `t${x.id}` ? (
                    <span className="flex shrink-0 items-center gap-1">
                      <button onClick={() => removeSlot(x.id)} className="min-h-10 rounded-lg bg-red-600 px-3 text-sm font-medium text-white">Remove</button>
                      <button onClick={() => setConfirmDel('')} className="min-h-10 px-2 text-sm text-gray-500">Cancel</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDel(`t${x.id}`)} aria-label="Remove time" className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-red-600"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Live sessions</h2>
        {sessions.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-400">No live sessions yet.</p>}
        <Group title="Open now" list={live} />
        <Group title="Upcoming" list={upcoming} />
        <Group title="Earlier" list={past} />
      </section>

      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center">
          <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">{editId ? 'Edit session' : 'New live session'}</h2>
              <button onClick={() => { setForm(null); setEditId(null); }} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title, for example Algebra revision" className={inputCls} />
              {!editId && (
                <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className={inputCls}>
                  <option value="">Choose a course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.class_name ? `${c.class_name} - ${c.title}` : `${c.title} (no class yet)`}</option>)}
                </select>
              )}
              {picked && !picked.class_id && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">This course is not in a class yet, so students will not see the session. Ask the school office to add it to a class.</p>}
              <div>
                <label className="text-xs text-gray-400">Date and time (optional)</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className={inputCls} />
              </div>
              <input type="number" min={5} max={600} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} placeholder="Length in minutes (optional)" className={inputCls} />
              <input value={form.meeting_url} onChange={(e) => setForm({ ...form, meeting_url: e.target.value })} placeholder="Meeting link (Google Meet, Zoom...)" className={inputCls} />
              {formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{formError}</p>}
              <button onClick={saveSession} disabled={saving} className="min-h-12 w-full rounded-xl bg-blue-600 font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : editId ? 'Save changes' : 'Create session'}</button>
            </div>
          </div>
        </div>
      )}

      {slotForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center">
          <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Weekly lecture time</h2>
              <button onClick={() => setSlotForm(null)} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <select value={slotForm.course_id} onChange={(e) => setSlotForm({ ...slotForm, course_id: e.target.value })} className={inputCls}>
                <option value="">Choose a course</option>
                {slotCourses.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.title}</option>)}
              </select>
              {slotCourses.length === 0 && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">None of your courses are in a class yet. Ask the school office to add them.</p>}
              <select value={slotForm.day_of_week} onChange={(e) => setSlotForm({ ...slotForm, day_of_week: e.target.value })} className={inputCls}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-400">Starts</label><input type="time" value={slotForm.start_time} onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} className={inputCls} /></div>
                <div><label className="text-xs text-gray-400">Ends</label><input type="time" value={slotForm.end_time} onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} className={inputCls} /></div>
              </div>
              {formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{formError}</p>}
              <button onClick={saveSlot} disabled={saving} className="min-h-12 w-full rounded-xl bg-blue-600 font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : 'Add weekly time'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
