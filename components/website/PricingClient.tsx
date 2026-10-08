'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';

const plans = [
  { name: 'Basic', m: 0, items: ['Core LMS', 'Courses and lessons', 'Student and teacher accounts'], hi: false },
  { name: 'Standard', m: 15000, items: ['Everything in Basic', 'Parent portal', 'Analytics', 'WhatsApp notifications'], hi: true },
  { name: 'Premium', m: 35000, items: ['Everything in Standard', 'AI Tutor', 'Blockchain certificates', 'Priority support'], hi: false },
];
const fmt = (n: number) => (n === 0 ? 'Free' : '₦' + n.toLocaleString('en-NG'));

export default function PricingClient() {
  const [annual, setAnnual] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState<{ type: string; value: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [applying, setApplying] = useState(false);

  async function applyCoupon() {
    if (!coupon.trim()) return;
    setApplying(true); setCouponMsg(''); setDiscount(null);
    try {
      const res = await fetch(`${API}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setCouponMsg(data.error || 'Invalid coupon'); }
      else { setDiscount({ type: data.discount_type, value: data.discount_value }); setCouponMsg('Coupon applied!'); }
    } catch { setCouponMsg('Failed to validate coupon'); }
    setApplying(false);
  }

  function applyDiscount(price: number) {
    if (!discount || price === 0) return price;
    if (discount.type === 'percentage') return Math.max(0, price - price * discount.value / 100);
    return Math.max(0, price - discount.value);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-3 text-sm font-medium">
        <span className={annual ? 'text-slate-400' : 'text-slate-900'}>Monthly</span>
        <button aria-label="Toggle billing" onClick={() => setAnnual(!annual)} className={`relative h-8 w-14 rounded-full transition ${annual ? 'bg-blue-600' : 'bg-slate-300'}`}>
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${annual ? 'left-7' : 'left-1'}`} />
        </button>
        <span className={annual ? 'text-slate-900' : 'text-slate-400'}>Annual <span className="text-emerald-600">2 months free</span></span>
      </div>
      <div className="flex justify-center mb-6 gap-2">
        <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="border border-slate-300 rounded-lg px-4 py-2 text-sm w-48" />
        <button onClick={applyCoupon} disabled={applying} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50">{applying ? '…' : 'Apply'}</button>
      </div>
      {couponMsg && <p className={`text-center text-sm mb-4 ${discount ? 'text-emerald-600' : 'text-red-500'}`}>{couponMsg}</p>}
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map(p => {
          const base = annual ? p.m * 10 : p.m;
          const final = applyDiscount(base);
          return (
            <div key={p.name} className={`rounded-2xl bg-white p-6 ${p.hi ? 'border-2 border-blue-600 shadow-lg' : 'border border-slate-200'}`}>
              {p.hi && <div className="mb-2 text-xs font-bold uppercase text-blue-600">Recommended</div>}
              <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
              <div className="mt-2 text-3xl font-bold text-slate-900">
                {discount && base > 0 && <span className="text-lg line-through text-slate-400 mr-2">{fmt(base)}</span>}
                {fmt(Math.round(final))}
              </div>
              <div className="text-sm text-slate-500">{p.m === 0 ? 'forever' : annual ? 'per year' : 'per month'}</div>
              <ul className="my-5 space-y-2">{p.items.map(i => <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-emerald-500" />{i}</li>)}</ul>
              <Link href="/register" className={`flex min-h-11 items-center justify-center rounded-lg font-semibold ${p.hi ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-700'}`}>Get Started</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
