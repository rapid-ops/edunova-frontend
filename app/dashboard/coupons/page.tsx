'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Coupon { id: number; code: string; discount_percent: number; max_uses: number; used_count: number; expires_at: string; is_active: boolean; }
export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: '', discount_percent: 10, max_uses: 100, expires_at: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/coupons/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setCoupons(d.coupons || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const create = async () => { await fetch(`${API}/api/coupons`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, school_id: user.school_id }) }); setForm({ code: '', discount_percent: 10, max_uses: 100, expires_at: '' }); setShowForm(false); load(); };
  const del = async (id: number) => { await fetch(`${API}/api/coupons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Coupons</h1></div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ New Coupon</button>
        </div>
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-3">
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Code e.g. SAVE20" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none col-span-2" />
            <input type="number" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: Number(e.target.value) })} placeholder="Discount %" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: Number(e.target.value) })} placeholder="Max uses" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <input type="datetime-local" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none col-span-2" />
            <div className="col-span-2 flex gap-3"><button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create</button><button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {coupons.length === 0 ? <div className="p-12 text-center text-gray-400">No coupons yet.</div> : coupons.map(c => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0">
              <div><div className="font-mono font-bold text-blue-600">{c.code}</div><div className="text-xs text-gray-400">{c.discount_percent}% off · {c.used_count}/{c.max_uses} used{c.expires_at ? ` · expires ${new Date(c.expires_at).toLocaleDateString()}` : ''}</div></div>
              <button onClick={() => del(c.id)} className="text-red-400 text-sm hover:text-red-600">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
