'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';
type Plan = { name: string; m: number; months: number; items: string[]; hi: boolean };
// Shown only if the plans cannot be loaded; the real plans are set by the platform owner
const FALLBACK: Plan[] = [
  { name: 'Basic', m: 5000, months: 1, items: ['Core LMS', 'Courses and lessons', 'Student and teacher accounts'], hi: false },
  { name: 'Standard', m: 15000, months: 1, items: ['Everything in Basic', 'Parent portal', 'Analytics', 'WhatsApp notifications'], hi: true },
  { name: 'Premium', m: 30000, months: 1, items: ['Everything in Standard', 'AI Tutor', 'Blockchain certificates', 'Priority support'], hi: false },
];
const per = (months: number) => (months === 1 ? 'per month' : months === 12 ? 'per year' : `every ${months} months`);
const fmt = (n: number) => n === 0 ? 'Free' : '₦' + n.toLocaleString('en-NG');

export default function PricingClient() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState<{ type: string; value: number } | null>(null);
  const [msg, setMsg] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetch(`${API}/subscriptions/plans`).then((r) => r.json()).then((d) => {
      const list: any[] = d.plans || [];
      if (!list.length) return;
      const mid = Math.floor(list.length / 2);
      setPlans(list.map((p, i) => ({
        name: p.name, m: p.price_ngn, months: p.period_months || 1, hi: list.length > 1 && i === mid,
        items: [...(p.features || []), p.max_users ? `Up to ${Number(p.max_users).toLocaleString('en-NG')} users` : 'Unlimited users'],
      })));
    }).catch(() => {});
  }, []);

  async function apply() {
    if (!code.trim()) return;
    setApplying(true); setMsg(''); setDiscount(null);
    try {
      const res = await fetch(`${API}/coupons/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code.trim() }) });
      const data = await res.json();
      if (!res.ok || data.error) { setMsg(data.error || 'Invalid coupon'); }
      else { setDiscount({ type: data.discount_type, value: data.discount_value }); setMsg('Coupon applied!'); }
    } catch { setMsg('Failed to validate coupon'); }
    setApplying(false);
  }

  function finalPrice(base: number) {
    if (!discount || base === 0) return base;
    return Math.max(0, discount.type === 'percentage' ? base - base * discount.value / 100 : base - discount.value);
  }

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map(p => {
          const base = p.m;
          const final = Math.round(finalPrice(base));
          return (
            <div key={p.name} className={`rounded-2xl bg-white p-6 ${p.hi ? 'border-2 border-blue-600 shadow-lg' : 'border border-slate-200'}`}>
              {p.hi && <div className="mb-2 text-xs font-bold uppercase text-blue-600">Recommended</div>}
              <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
              <div className="mt-2 text-3xl font-bold text-slate-900">
                {discount && base > 0 && <span className="text-lg line-through text-slate-400 mr-1">{fmt(base)}</span>}
                {fmt(final)}
              </div>
              <div className="text-sm text-slate-500">{p.m === 0 ? 'forever' : per(p.months)}</div>
              <ul className="my-5 space-y-2">{p.items.map(i => <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-emerald-500" />{i}</li>)}</ul>
              <Link href="/register" className={`flex min-h-11 items-center justify-center rounded-lg font-semibold ${p.hi ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-700'}`}>Get Started</Link>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="border border-slate-300 rounded-lg px-4 py-2 text-sm w-48" />
          <button onClick={apply} disabled={applying} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50">{applying ? '…' : 'Apply'}</button>
        </div>
        {msg && <p className={`text-sm ${discount ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>}
      </div>
    </div>
  );
}
