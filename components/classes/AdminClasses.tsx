'use client';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, Plus, School, Trash2, UserPlus, Users } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { errMsg, inputCls } from './util';

export default function AdminClasses() {
  const { user } = useAuthStore();
  const schoolId = user?.school_id;
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [newForm, setNewForm] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadList = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    try { const r = await api.get(`/classes/school/${schoolId}`); setList(r.data.classes || []); setError(''); }
    catch (e: any) { setError(errMsg(e)); }
    setLoading(false);
  }, [schoolId]);
  useEffect(() => { loadList(); }, [loadList]);

  const create = async () => {
    if (!newForm || !newForm.name.trim()) { setError('Please enter a class name.'); return; }
    setBusy(true); setError('');
    try {
      const r = await api.post('/classes', { name: newForm.name.trim(), grade_level: newForm.grade_level.trim() || null });
      setNewForm(null);
      await loadList();
      setOpenId(r.data.class.id);
    } catch (e: any) { setError(errMsg(e)); }
    setBusy(false);
  };

  if (openId) return <ClassDetail id={openId} onBack={() => { setOpenId(null); loadList(); }} />;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-5 text-gray-900">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Classes</h1>
        <button onClick={() => { setError(''); setNewForm({ name: '', grade_level: '' }); }} className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white"><Plus size={16} /> New class</button>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {newForm && (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} placeholder="Class name, for example SS2 Science" className={inputCls} />
          <input value={newForm.grade_level} onChange={(e) => setNewForm({ ...newForm, grade_level: e.target.value })} placeholder="Level, for example SS2" className={inputCls} />
          <div className="flex gap-2">
            <button onClick={create} disabled={busy} className="min-h-11 flex-1 rounded-xl bg-blue-600 font-medium text-white disabled:opacity-50">{busy ? 'Creating...' : 'Create class'}</button>
            <button onClick={() => setNewForm(null)} className="min-h-11 px-4 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && list.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-400">No classes yet. Tap New class.</p>}
      {list.map((c) => (
        <button key={c.id} onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><School size={18} /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{c.name}{c.grade_level ? ` - ${c.grade_level}` : ''}</p>
            <p className="truncate text-xs text-gray-500">{c.teacher_name ? `Class teacher: ${c.teacher_name}` : 'No class teacher yet'} - {c.course_count || 0} courses</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500"><Users size={13} /> {c.student_count}</span>
        </button>
      ))}
    </div>
  );
}

function ClassDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const [edit, setEdit] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState('');
  const [cands, setCands] = useState<any[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [courseId, setCourseId] = useState('');
  const [delAsk, setDelAsk] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/class-hub/admin/${id}`);
      setD(r.data);
      setEdit((cur: any) => cur || {
        name: r.data.class.name || '', grade_level: r.data.class.grade_level || '', room: r.data.class.room || '',
        capacity: r.data.class.capacity ? String(r.data.class.capacity) : '', teacher_id: r.data.class.teacher_id ? String(r.data.class.teacher_id) : '',
      });
      setErr('');
    } catch (e: any) { setErr(errMsg(e)); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const searchCands = useCallback(async (text: string) => {
    try { const r = await api.get(`/student-classes/candidates/${id}`, { params: { q: text } }); setCands(r.data.students || []); }
    catch (e: any) { setNote(errMsg(e)); }
  }, [id]);
  useEffect(() => {
    if (!addOpen) return;
    const t = setTimeout(() => searchCands(q), 300);
    return () => clearTimeout(t);
  }, [addOpen, q, searchCands]);

  const saveDetails = async () => {
    if (!edit) return;
    setSaving(true); setNote('');
    try {
      await api.put(`/classes/${id}`, {
        name: edit.name, grade_level: edit.grade_level || null, room: edit.room || null,
        capacity: edit.capacity || null, teacher_id: edit.teacher_id || null,
      });
      setNote('Saved.');
      setEdit(null);
      await load();
    } catch (e: any) { setNote(errMsg(e)); }
    setSaving(false);
  };

  const addStudents = async () => {
    if (!picked.length) return;
    setNote('');
    try {
      const r = await api.post('/student-classes/bulk', { class_id: id, student_ids: picked });
      setNote(r.data.message || 'Students added.');
      setPicked([]); setAddOpen(false); setQ('');
      await load();
    } catch (e: any) { setNote(errMsg(e)); }
  };
  const removeStudent = async (sid: number) => {
    setNote('');
    try { await api.delete(`/student-classes/${sid}/${id}`); await load(); setNote('Student removed.'); } catch (e: any) { setNote(errMsg(e)); }
  };
  const addCourse = async () => {
    if (!courseId) return;
    setNote('');
    try { await api.post(`/class-hub/admin/${id}/courses`, { course_id: Number(courseId) }); setCourseId(''); await load(); setNote('Course added.'); } catch (e: any) { setNote(errMsg(e)); }
  };
  const removeCourse = async (cid: number) => {
    setNote('');
    try { await api.delete(`/class-hub/admin/${id}/courses/${cid}`); await load(); setNote('Course removed.'); } catch (e: any) { setNote(errMsg(e)); }
  };
  const setCourseTeacher = async (cid: number, tid: string) => {
    setNote('');
    try { await api.put(`/class-hub/admin/courses/${cid}/teacher`, { teacher_id: tid || null }); await load(); setNote('Teacher updated.'); } catch (e: any) { setNote(errMsg(e)); }
  };
  const deleteClass = async () => {
    try { await api.delete(`/classes/${id}`); onBack(); } catch (e: any) { setNote(errMsg(e)); setDelAsk(false); }
  };

  if (!d && !err) return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  if (!d) return <div className="p-6 text-sm text-red-600">{err}</div>;

  const students: any[] = d.students || [];
  const courses: any[] = d.courses || [];
  const teachers: any[] = d.teachers || [];
  const available: any[] = d.available_courses || [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-5 text-gray-900">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-lg text-blue-600"><ChevronLeft size={22} /></button>
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{d.class.name}</h1>
      </div>
      {note && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{note}</p>}

      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700">Class details</h2>
        {edit && (
          <>
            <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Class name" className={inputCls} />
            <input value={edit.grade_level} onChange={(e) => setEdit({ ...edit, grade_level: e.target.value })} placeholder="Level, for example SS2" className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input value={edit.room} onChange={(e) => setEdit({ ...edit, room: e.target.value })} placeholder="Room" className={inputCls} />
              <input type="number" min={1} value={edit.capacity} onChange={(e) => setEdit({ ...edit, capacity: e.target.value })} placeholder="Capacity" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-400">Class teacher</label>
              <select value={edit.teacher_id} onChange={(e) => setEdit({ ...edit, teacher_id: e.target.value })} className={inputCls}>
                <option value="">No class teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
            <button onClick={saveDetails} disabled={saving} className="min-h-11 w-full rounded-xl bg-blue-600 font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save details'}</button>
          </>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-700">Students ({students.length}{d.class.capacity ? ` of ${d.class.capacity}` : ''})</h2>
          <button onClick={() => { setAddOpen(!addOpen); setPicked([]); setQ(''); }} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"><UserPlus size={15} /> Add students</button>
        </div>
        {addOpen && (
          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className={inputCls} />
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {cands.length === 0 && <p className="py-3 text-center text-sm text-gray-400">No students to add.</p>}
              {cands.map((s) => (
                <label key={s.id} className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm">
                  <input type="checkbox" checked={picked.includes(s.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, s.id] : picked.filter((x) => x !== s.id))} className="h-4 w-4 accent-blue-600" />
                  <span className="min-w-0 flex-1 truncate">{s.full_name}</span>
                  {s.class_names && <span className="shrink-0 text-xs text-gray-400">{s.class_names}</span>}
                </label>
              ))}
            </div>
            <button onClick={addStudents} disabled={!picked.length} className="min-h-11 w-full rounded-xl bg-blue-600 font-medium text-white disabled:opacity-50">Add {picked.length || ''} selected</button>
          </div>
        )}
        {students.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-400">No students in this class yet.</p>}
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{s.full_name}</p>
              <p className="truncate text-xs text-gray-500">{s.email}</p>
            </div>
            <button onClick={() => removeStudent(s.id)} className="min-h-10 shrink-0 rounded-lg px-3 text-sm text-red-600">Remove</button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Courses this class takes ({courses.length})</h2>
        <div className="flex gap-2">
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputCls}>
            <option value="">Add a course...</option>
            {available.map((c) => <option key={c.id} value={c.id}>{c.title}{c.class_name ? ` (now in ${c.class_name})` : ''}</option>)}
          </select>
          <button onClick={addCourse} disabled={!courseId} className="min-h-12 shrink-0 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-50">Add</button>
        </div>
        {courses.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-400">No courses added yet.</p>}
        {courses.map((c) => (
          <div key={c.id} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-semibold">{c.title}</p>
              <button onClick={() => removeCourse(c.id)} aria-label="Remove course" className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-red-600"><Trash2 size={16} /></button>
            </div>
            <label className="text-xs text-gray-400">Teacher of this course</label>
            <select value={c.teacher_id ? String(c.teacher_id) : ''} onChange={(e) => setCourseTeacher(c.id, e.target.value)} className={inputCls}>
              <option value="">{c.teacher_name ? `${c.teacher_name} (assigned elsewhere)` : 'No teacher yet'}</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </div>
        ))}
      </section>

      <section className="border-t border-gray-200 pt-4">
        {delAsk ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Delete this class? Students stay on the school but leave the class.</span>
            <button onClick={deleteClass} className="min-h-10 rounded-lg bg-red-600 px-3 text-sm font-medium text-white">Yes, delete</button>
            <button onClick={() => setDelAsk(false)} className="min-h-10 px-2 text-sm text-gray-500">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setDelAsk(true)} className="min-h-10 text-sm text-red-600">Delete this class</button>
        )}
      </section>
    </div>
  );
}
