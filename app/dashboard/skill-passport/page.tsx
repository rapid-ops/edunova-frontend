'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Passport { id: number; passport_id: string; skills: any[]; external_sources: any[]; verified_at: string; }
export default function SkillPassportPage() {
  const router = useRouter();
  const [passport, setPassport] = useState<Passport | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [external, setExternal] = useState({ source: '', url: '', skill: '' });
  const [showExternal, setShowExternal] = useState(false);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/skill-passport/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setPassport(d.passport); setLoading(false); });
  useEffect(() => { load(); }, []);
  const sync = async () => { setSyncing(true); await fetch(`${API}/api/skill-passport/${user.id}/sync`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); setSyncing(false); load(); };
  const addExternal = async () => { await fetch(`${API}/api/skill-passport/${user.id}/external`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(external) }); setExternal({ source: '', url: '', skill: '' }); setShowExternal(false); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Skill Passport</h1></div>
          <div className="flex gap-2"><button onClick={() => setShowExternal(true)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">+ External</button><button onClick={sync} disabled={syncing} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{syncing ? 'Syncing...' : 'Sync'}</button></div>
        </div>
        {passport && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4"><div><div className="text-xs text-gray-400 mb-1">Passport ID</div><div className="font-mono font-bold text-blue-600 text-lg">{passport.passport_id}</div></div><button onClick={() => navigator.clipboard.writeText(passport.passport_id)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">Copy ID</button></div>
              <div className="text-xs text-gray-400">Last synced: {new Date(passport.verified_at).toLocaleString()}</div>
            </div>
            {showExternal && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <h3 className="font-medium text-gray-900">Add External Skill</h3>
                <input value={external.source} onChange={e => setExternal({ ...external, source: e.target.value })} placeholder="Source (e.g. Coursera, YouTube)" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
                <input value={external.skill} onChange={e => setExternal({ ...external, skill: e.target.value })} placeholder="Skill name" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
                <input value={external.url} onChange={e => setExternal({ ...external, url: e.target.value })} placeholder="Certificate URL" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
                <div className="flex gap-3"><button onClick={addExternal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add</button onClick={() => setShowExternal(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Verified Skills ({(passport.skills || []).length})</h2>
              <div className="flex flex-wrap gap-2">{(passport.skills || []).map((s: any, i: number) => (<span key={i} className={`text-xs px-3 py-1 rounded-full font-medium ${s.type === 'certificate' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-700'}`}>{s.name}</span>))}</div>
              {(passport.skills || []).length === 0 && <p className="text-gray-400 text-sm">No skills yet. Click Sync to load from your certificates and competencies.</p>}
            </div>
            {(passport.external_sources || []).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-4">External Sources</h2>
                <div className="space-y-2">{passport.external_sources.map((s: any, i: number) => (<div key={i} className="flex items-center justify-between text-sm"><div><span className="text-gray-900">{s.skill}</span><span className="text-gray-400 ml-2">via {s.source}</span></div>{s.url && <a href={s.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>}</div>))}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
