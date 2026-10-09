'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, BookOpen, Link2 } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';
const FRAMEWORKS = ['WAEC','NECO','JAMB','Cambridge','Custom'];

export default function CurriculumPage() {
  const router = useRouter();
  const [standards, setStandards] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', framework:'WAEC', description:'' });
  const [linkForm, setLinkForm] = useState<{standardId:number,courseId:string}|null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const h = { Authorization: `Bearer ${token}` };

  const load = async () => {
    const [sd, cd] = await Promise.all([
      fetch(`${API}/curriculums/school/${user.school_id}`, { headers: h }).then(r => r.json()),
      fetch(`${API}/courses/school/${user.school_id}`, { headers: h }).then(r => r.json()),
    ]);
    setStandards(sd.standards || []);
    setCourses(cd.courses || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return;
    setSaving(true); setError('');
    const res = await fetch(`${API}/curriculums`, {
      method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, school_id: user.school_id }),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error || 'Failed'); setSaving(false); return; }
    setShowForm(false); setForm({ name:'', framework:'WAEC', description:'' }); load();
    setSaving(false);
  };

  const link = async () => {
    if (!linkForm?.courseId) return;
    await fetch(`${API}/curriculums/link`, {
      method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard_id: linkForm.standardId, course_id: Number(linkForm.courseId) }),
    });
    setLinkForm(null); load();
  };

  if (loading) return <LoadingScreen />;
  const totalCourses = courses.length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
          <h1 className="text-lg font-bold">Curriculum Standards</h1>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
          <Plus size={14} />New
        </button>
      </div>
      <div className="px-4 py-4 space-y-4">
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <input value={form.name} onChange={e => setForm({...form, name:e.target.value})}
              placeholder="Standard name (e.g. WAEC Senior Secondary)" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <select value={form.framework} onChange={e => setForm({...form, framework:e.target.value})}
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
              {FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})}
              placeholder="Description (optional)" rows={2} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button onClick={create} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Create Standard'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
        {linkForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-blue-700">Link course to standard</p>
            <select value={linkForm.courseId} onChange={e => setLinkForm({...linkForm, courseId:e.target.value})}
              className="w-full bg-white border border-blue-200 rounded-lg px-4 py-2.5 text-sm outline-none">
              <option value="">Select course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={link} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm">Link</button>
              <button onClick={() => setLinkForm(null)} className="flex-1 bg-white border border-blue-200 text-blue-600 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
        {standards.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No curriculum standards yet.</p>
          </div>
        ) : standards.map((s: any) => {
          const linked = s.linked_courses || 0;
          const pct = totalCourses > 0 ? Math.round((linked / totalCourses) * 100) : 0;
          return (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                  <span className="text-xs text-blue-600 font-medium">{s.framework}</span>
                  {s.description && <p className="text-xs text-gray-400 mt-1">{s.description}</p>}
                </div>
                <button onClick={() => setLinkForm({ standardId: s.id, courseId: '' })}
                  className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                  <Link2 size={12} />Link
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-500">{linked}/{totalCourses} courses ({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
