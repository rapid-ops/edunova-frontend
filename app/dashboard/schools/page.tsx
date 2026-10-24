'use client';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Search, ChevronLeft } from 'lucide-react';

export default function SchoolsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [schools, setSchools] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get('/schools');
      setSchools(r.data.schools || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (school: any) => {
    await api.put(`/schools/${school.id}`, { is_active: !school.is_active });
    load();
    if (selected?.id === school.id) setSelected({ ...selected, is_active: !school.is_active });
  };

  if (loading) return <LoadingScreen />;

  const filtered = schools.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.subdomain?.toLowerCase().includes(search.toLowerCase()));
  const pending = schools.filter(s => !s.is_active);

  if (selected) return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => setSelected(null)} className="text-blue-600"><ChevronLeft size={20} /></button>
        <h1 className="text-lg font-bold">{selected.name}</h1>
      </div>
      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
          <div className="flex justify-between"><span className="text-sm text-gray-400">Subdomain</span><span className="text-sm font-medium">{selected.subdomain}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-400">Status</span><span className={`text-sm font-medium ${selected.is_active ? 'text-green-600' : 'text-red-500'}`}>{selected.is_active ? 'Active' : 'Inactive'}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-400">Created</span><span className="text-sm">{new Date(selected.created_at).toLocaleDateString()}</span></div>
          {selected.admin_email && <div className="flex justify-between"><span className="text-sm text-gray-400">Admin</span><span className="text-sm">{selected.admin_email}</span></div>}
        </div>
        <button onClick={() => toggleActive(selected)} className={`w-full py-3 rounded-xl text-sm font-medium ${selected.is_active ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {selected.is_active ? 'Suspend School' : 'Activate School'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-blue-600 text-sm">← Back</button>
        <h1 className="text-lg font-bold">Schools</h1>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schools..." className="flex-1 py-3 text-sm outline-none bg-transparent" />
        </div>

        {pending.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-2">{pending.length} pending approval</p>
            {pending.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-t border-yellow-100 first:border-0">
                <p className="text-sm text-gray-700">{s.name}</p>
                <button onClick={() => toggleActive(s)} className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">Approve</button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {filtered.map(s => (
            <button key={s.id} onClick={() => setSelected(s)} className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.subdomain} · {new Date(s.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
