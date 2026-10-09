'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';
type Tab = 'semesters' | 'programs' | 'batches';

export default function AcademicPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('semesters');
  const [semesters, setSemesters] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', start_date:'', end_date:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const h = { Authorization: `Bearer ${token}` };

  const load = async () => {
    const [sr, pr, br] = await Promise.all([
      fetch(`${API}/semesters/school/${user.school_id}`, { headers: h }).then(r=>r.json()).catch(()=>({})),
      fetch(`${API}/programs/school/${user.school_id}`, { headers: h }).then(r=>r.json()).catch(()=>({})),
      fetch(`${API}/batchs/school/${user.school_id}`, { headers: h }).then(r=>r.json()).catch(()=>({})),
    ]);
    setSemesters(sr.semesters || sr.data || []);
    setPrograms(pr.programs || pr.data || []);
    setBatches(br.batches || br.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const endpointMap: Record<Tab, string> = { semesters: 'semesters', programs: 'programs', batches: 'batchs' };

  const create = async () => {
    if (!form.name.trim()) return;
    setSaving(true); setError('');
    const res = await fetch(`${API}/${endpointMap[tab]}`, {
      method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, school_id: user.school_id }),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error||'Failed'); setSaving(false); return; }
    setShowForm(false); setForm({ name:'', start_date:'', end_date:'' }); load(); setSaving(false);
  };

  const del = async (id: number) => {
    await fetch(`${API}/${endpointMap[tab]}/${id}`, { method:'DELETE', headers: h });
    load();
  };

  const items = tab === 'semesters' ? semesters : tab === 'programs' ? programs : batches;
  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
          <h1 className="text-lg font-bold">Academic Structure</h1>
        </div>
        <button onClick={() => { setShowForm(s=>!s); setError(''); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
          <Plus size={14} />Add
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {(['semesters','programs','batches'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }}
            className={`flex-1 py-3 text-sm font-medium capitalize ${tab===t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
              placeholder={`${tab.slice(0,-1)} name`} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Start date</label>
                <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">End date</label>
                <input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button onClick={create} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Saving...' : `Create ${tab.slice(0,-1)}`}
              </button>
              <button onClick={()=>setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
        {items.length === 0 && !showForm
          ? <p className="text-center text-gray-400 text-sm py-12">No {tab} yet.</p>
          : items.map((item: any) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                {(item.start_date || item.end_date) && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.start_date ? new Date(item.start_date).toLocaleDateString('en-NG') : ''} 
                    {item.start_date && item.end_date ? ' — ' : ''}
                    {item.end_date ? new Date(item.end_date).toLocaleDateString('en-NG') : ''}
                  </p>
                )}
                {item.is_active && <span className="text-xs text-green-600 font-medium">Active</span>}
              </div>
              <button onClick={() => del(item.id)} className="text-red-400 p-1 ml-3"><Trash2 size={15} /></button>
            </div>
          ))}
      </div>
    </div>
  );
}
