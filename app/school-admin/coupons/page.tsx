'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Coupon { id: number; code: string; discount_type: string; discount_value: number; usage_count: number; max_uses: number | null; expires_at: string | null; is_active: boolean; }

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    api.get('/payments/coupons').then(r => { setCoupons(r.data.coupons || []); setLoading(false); }).catch(() => setLoading(false));
  }
  useEffect(load, []);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/payments/coupons', { ...form, discount_value: Number(form.discount_value), max_uses: form.max_uses ? Number(form.max_uses) : null, expires_at: form.expires_at || null });
      setForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
      load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Failed to create coupon'); }
    setSaving(false);
  }

  async function toggle(id: number, active: boolean) {
    await api.patch(`/payments/coupons/${id}`, { is_active: !active });
    load();
  }

  return (
    <main className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Coupons</h1>
      <form onSubmit={create} className="bg-white border border-slate-200 rounded-xl p-5 mb-8 grid grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <label className="text-xs text-slate-500 mb-1 block">Code</label>
          <input required value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="SAVE20" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Type</label>
          <select value={form.discount_type} onChange={e => setForm(f => ({...f, discount_type: e.target.value}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed (₦)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Value</label>
          <input required type="number" min="1" value={form.discount_value} onChange={e => setForm(f => ({...f, discount_value: e.target.value}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Max uses (optional)</label>
          <input type="number" min="1" value={form.max_uses} onChange={e => setForm(f => ({...f, max_uses: e.target.value}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Expires (optional)</label>
          <input type="date" value={form.expires_at} onChange={e => setForm(f => ({...f, expires_at: e.target.value}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        {error && <p className="col-span-2 text-red-500 text-sm">{error}</p>}
        <div className="col-span-2">
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Creating…' : 'Create Coupon'}</button>
        </div>
      </form>
      {loading && <p className="text-slate-400">Loading…</p>}
      <div className="space-y-3">
        {coupons.map(c => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-mono font-bold text-slate-900">{c.code}</p>
              <p className="text-xs text-slate-500">{c.discount_type === 'percentage' ? `${c.discount_value}% off` : `₦${c.discount_value} off`} · {c.usage_count}/{c.max_uses ?? '∞'} used{c.expires_at ? ` · exp ${new Date(c.expires_at).toLocaleDateString('en-GB')}` : ''}</p>
            </div>
            <button onClick={() => toggle(c.id, c.is_active)} className={`px-3 py-1 rounded-lg text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.is_active ? 'Active' : 'Inactive'}</button>
          </div>
        ))}
      </div>
    </main>
  );
}
