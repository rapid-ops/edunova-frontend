'use client';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Search, ChevronLeft } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = { active: 'Active', trial: 'On trial', expired: 'Expired', cancelled: 'Cancelled', none: 'No plan' };
const STATUS_COLOR: Record<string, string> = { active: 'bg-green-100 text-green-700', trial: 'bg-blue-100 text-blue-700', expired: 'bg-red-100 text-red-600', cancelled: 'bg-gray-100 text-gray-500', none: 'bg-gray-100 text-gray-500' };
const errMsg = (e: any): string => e?.response?.data?.error || 'Something went wrong. Please try again.';

export default function SchoolsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [planPick, setPlanPick] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/owner/schools');
      setSchools(r.data.schools || []);
      setPlans(r.data.plans || []);
    } catch (e: any) { setNote(errMsg(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (s: any) => {
    setBusy(true); setNote('');
    try { await api.put(`/owner/schools/${s.id}`, { is_active: !s.is_active }); await load(); setNote(s.is_active ? 'School suspended.' : 'School activated.'); }
    catch (e: any) { setNote(errMsg(e)); }
    setBusy(false);
  };
  const setPlan = async (s: any) => {
    if (!planPick) return;
    const p = plans.find((x) => x.key === planPick);
    if (!confirm(`Give ${s.name} the ${p ? p.name : planPick} plan without a payment?`)) return;
    setBusy(true); setNote('');
    try { await api.put(`/owner/schools/${s.id}/plan`, { plan: planPick }); await load(); setNote('Plan updated.'); setPlanPick(''); }
    catch (e: any) { setNote(errMsg(e)); }
    setBusy(false);
  };

  if (loading) return <LoadingScreen />;

  const term = search.toLowerCase();
  const filtered = schools.filter((s) => {
    if (term && !(s.name || '').toLowerCase().includes(term) && !(s.subdomain || '').toLowerCase().includes(term)) return false;
    if (filter === 'active') return s.is_active;
    if (filter === 'inactive') return !s.is_active;
    if (filter === 'over') return s.over_limit;
    return true;
  });
  const pending = schools.filter((s) => !s.is_active);
  const selected = schools.find((s) => s.id === selectedId);

  if (selected) {
    const row = (label: string, value: any) => (
      <div className="flex justify-between gap-3"><span className="text-sm text-gray-400">{label}</span><span className="text-sm font-medium text-right">{value}</span></div>
    );
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
          <button onClick={() => { setSelectedId(null); setNote(''); }} aria-label="Back" className="text-blue-600"><ChevronLeft size={20} /></button>
          <h1 className="text-lg font-bold truncate">{selected.name}</h1>
        </div>
        <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
          {note && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{note}</p>}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            {row('Address', `${selected.subdomain}`)}
            {row('Status', <span className={selected.is_active ? 'text-green-600' : 'text-red-500'}>{selected.is_active ? 'Active' : 'Suspended'}</span>)}
            {row('Created', new Date(selected.created_at).toLocaleDateString())}
            {selected.admin_email && row('Admin', selected.admin_email)}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-sm mb-1">Users</p>
            {row('Students', selected.students)}
            {row('Teachers', selected.teachers)}
            {row('Parents', selected.parents)}
            {row('Admins', selected.admins)}
            {row('Total', <span className={selected.over_limit ? 'text-red-600' : ''}>{selected.total_users}{selected.user_limit ? ` of ${selected.user_limit}` : ' (no limit)'}</span>)}
            {selected.over_limit && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600">This school has more users than its plan allows.</p>}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-sm">Plan</p>
            {row('Current plan', selected.plan_name || 'None')}
            {row('Subscription', <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[selected.subscription_status]}`}>{STATUS_LABEL[selected.subscription_status]}</span>)}
            {selected.period_end && row('Runs until', new Date(selected.period_end).toLocaleDateString('en-GB'))}
            <select value={planPick} onChange={(e) => setPlanPick(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm">
              <option value="">Give this school a plan...</option>
              {plans.map((p) => <option key={p.key} value={p.key}>{p.name} - {p.period_months} month{p.period_months > 1 ? 's' : ''}</option>)}
            </select>
            <button onClick={() => setPlan(selected)} disabled={!planPick || busy} className="w-full min-h-11 rounded-xl bg-blue-600 text-sm font-medium text-white disabled:opacity-50">Set plan without payment</button>
          </div>
          <button onClick={() => toggleActive(selected)} disabled={busy} className={`w-full min-h-12 rounded-xl text-sm font-medium disabled:opacity-50 ${selected.is_active ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-600 text-white'}`}>
            {selected.is_active ? 'Suspend school' : 'Activate school'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-blue-600 text-sm">Back</button>
        <h1 className="text-lg font-bold">Schools ({schools.length})</h1>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {note && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{note}</p>}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search schools..." className="flex-1 py-3 text-sm outline-none bg-transparent" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive'], ['over', 'Over user limit']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`shrink-0 min-h-10 rounded-full px-4 text-sm ${filter === k ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{l}</button>
          ))}
        </div>

        {pending.length > 0 && filter === 'all' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-2">{pending.length} inactive or waiting for approval</p>
            {pending.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-t border-yellow-100 first:border-0">
                <p className="text-sm text-gray-700">{s.name}</p>
                <button onClick={() => toggleActive(s)} disabled={busy} className="min-h-9 text-xs bg-green-600 text-white px-3 rounded-full disabled:opacity-50">Activate</button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-6">No schools match.</p>}
          {filtered.map((s) => (
            <button key={s.id} onClick={() => { setSelectedId(s.id); setNote(''); setPlanPick(''); }} className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{s.subdomain} - created {new Date(s.created_at).toLocaleDateString()}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className={s.over_limit ? 'font-semibold text-red-600' : 'text-gray-600'}>{s.total_users}{s.user_limit ? ` / ${s.user_limit}` : ''} users</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{s.students} students, {s.teachers} teachers</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{s.plan_name || 'No plan'}</span>
                <span className={`rounded-full px-2 py-0.5 ${STATUS_COLOR[s.subscription_status]}`}>{STATUS_LABEL[s.subscription_status]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
