'use client';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus } from 'lucide-react';
import api from '@/lib/api';

const errMsg = (e: any): string => e?.response?.data?.error || 'Something went wrong. Please try again.';
const inputCls = 'w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900';
const naira = (n: number) => '₦' + Number(n || 0).toLocaleString('en-NG');
const toForm = (p: any) => ({
  name: p.name, price_ngn: String(p.price_ngn), max_users: p.max_users ? String(p.max_users) : '', period_months: String(p.period_months),
  features: (p.features || []).join('\n'), is_active: p.is_active, sort_order: String(p.sort_order),
});
const toBody = (f: any) => ({
  name: f.name, price_ngn: Number(f.price_ngn), max_users: f.max_users === '' ? null : Number(f.max_users), period_months: Number(f.period_months),
  features: String(f.features || '').split('\n').map((x: string) => x.trim()).filter(Boolean), is_active: !!f.is_active, sort_order: Number(f.sort_order),
});

export default function BillingRulesPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [forms, setForms] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState('');
  const [adding, setAdding] = useState<any>(null);

  const apply = (list: any[]) => {
    setPlans(list);
    const f: Record<string, any> = {};
    list.forEach((p) => { f[p.key] = toForm(p); });
    setForms(f);
  };
  const load = async () => {
    try { const r = await api.get('/owner/billing/plans'); apply(r.data.plans || []); }
    catch (e: any) { setBad(true); setNote(errMsg(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (key: string) => {
    setBusy(key); setNote(''); setBad(false);
    try { const r = await api.put(`/owner/billing/plans/${key}`, toBody(forms[key])); apply(r.data.plans || []); setNote('Saved. New payments use these rules.'); }
    catch (e: any) { setBad(true); setNote(errMsg(e)); }
    setBusy('');
  };
  const create = async () => {
    if (!adding) return;
    setBusy('new'); setNote(''); setBad(false);
    try {
      const r = await api.post('/owner/billing/plans', { key: adding.key, ...toBody(adding) });
      apply(r.data.plans || []); setAdding(null); setNote('Plan added.');
    } catch (e: any) { setBad(true); setNote(errMsg(e)); }
    setBusy('');
  };
  const set = (key: string, patch: any) => setForms({ ...forms, [key]: { ...forms[key], ...patch } });

  if (loading) return <LoadingScreen />;

  const Fields = ({ f, onChange }: { f: any; onChange: (p: any) => void }) => (
    <div className="space-y-3">
      <input value={f.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Plan name" className={inputCls} />
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-gray-400">Price (naira)</label><input type="number" min={0} value={f.price_ngn} onChange={(e) => onChange({ price_ngn: e.target.value })} className={inputCls} /></div>
        <div><label className="text-xs text-gray-400">Months paid for</label><input type="number" min={1} max={36} value={f.period_months} onChange={(e) => onChange({ period_months: e.target.value })} className={inputCls} /></div>
      </div>
      <div><label className="text-xs text-gray-400">Total users allowed (all students, teachers, parents and admins). Empty means no limit.</label>
        <input type="number" min={1} value={f.max_users} onChange={(e) => onChange({ max_users: e.target.value })} placeholder="No limit" className={inputCls} /></div>
      <div><label className="text-xs text-gray-400">What the plan includes (one line each)</label>
        <textarea rows={4} value={f.features} onChange={(e) => onChange({ features: e.target.value })} className={inputCls} /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_active} onChange={(e) => onChange({ is_active: e.target.checked })} className="h-4 w-4 accent-blue-600" /> Available to schools</label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Back" className="text-blue-600"><ChevronLeft size={20} /></button>
        <h1 className="text-lg font-bold flex-1">Billing rules</h1>
        <button onClick={() => { setNote(''); setAdding({ key: '', name: '', price_ngn: '0', max_users: '', period_months: '1', features: '', is_active: true, sort_order: String(plans.length + 1) }); }} className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white"><Plus size={16} /> Add plan</button>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <p className="text-sm text-gray-500">These plans are what schools see on the pricing page and what they are charged. A price change applies to new payments only. Schools are checked against the total users allowed on their plan, and any school over it is flagged on the Schools page.</p>
        {note && <p className={`rounded-xl p-3 text-sm ${bad ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>{note}</p>}

        {adding && (
          <div className="space-y-3 rounded-xl border border-blue-200 bg-white p-4">
            <p className="text-sm font-semibold">New plan</p>
            <input value={adding.key} onChange={(e) => setAdding({ ...adding, key: e.target.value.toLowerCase() })} placeholder="Short key, for example gold" className={inputCls} />
            <Fields f={adding} onChange={(p) => setAdding({ ...adding, ...p })} />
            <div className="flex gap-2">
              <button onClick={create} disabled={busy === 'new'} className="min-h-11 flex-1 rounded-xl bg-blue-600 font-medium text-white disabled:opacity-50">{busy === 'new' ? 'Adding...' : 'Add plan'}</button>
              <button onClick={() => setAdding(null)} className="min-h-11 px-4 text-sm text-gray-500">Cancel</button>
            </div>
          </div>
        )}

        {plans.map((p) => forms[p.key] && (
          <div key={p.key} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{p.name} <span className="text-xs font-normal text-gray-400">({p.key})</span></p>
              <span className="text-xs text-gray-500">{naira(p.price_ngn)} for {p.period_months} month{p.period_months > 1 ? 's' : ''}{p.is_active ? '' : ' - hidden'}</span>
            </div>
            <Fields f={forms[p.key]} onChange={(patch) => set(p.key, patch)} />
            <button onClick={() => save(p.key)} disabled={busy === p.key} className="min-h-11 w-full rounded-xl bg-blue-600 font-medium text-white disabled:opacity-50">{busy === p.key ? 'Saving...' : 'Save plan'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
