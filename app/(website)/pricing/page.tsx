import Link from 'next/link';
import PricingClient from '@/components/website/PricingClient';
import FAQAccordion from '@/components/website/FAQAccordion';
import { Check, Minus } from 'lucide-react';

export const metadata = { title: 'Pricing | Edunova', description: 'Simple Naira pricing for schools. Start free.' };

const rows: [string, boolean, boolean, boolean][] = [
  ['Courses and lessons', true, true, true], ['Student and teacher accounts', true, true, true],
  ['Parent portal', false, true, true], ['Analytics', false, true, true], ['WhatsApp notifications', false, true, true],
  ['AI Tutor', false, false, true], ['Blockchain certificates', false, false, true], ['Priority support', false, false, true],
];
const faq = [
  ['How does annual billing work?', 'Pay for 10 months and get 12. Standard is ₦150,000 per year and Premium is ₦350,000.'],
  ['Can I change plans?', 'Yes. You can upgrade or downgrade from your dashboard.'],
  ['How do I pay?', 'Payments are in Naira through Paystack.'],
  ['Is Basic really free?', 'Yes. Basic has no time limit.'],
].map(([q, a]) => ({ q, a }));
const Cell = ({ v }: { v: boolean }) => v ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <Minus className="mx-auto h-4 w-4 text-slate-300" />;

export default function Pricing() {
  return (
    <>
      <section className="px-4 py-16"><div className="mx-auto max-w-6xl">
        <h1 className="mb-3 text-center text-4xl font-bold tracking-tight text-slate-900">Simple pricing</h1>
        <p className="mb-10 text-center text-slate-600">Priced in Naira. Start free.</p>
        <PricingClient />
      </div></section>
      <section className="bg-slate-50 px-4 py-14"><div className="mx-auto max-w-3xl overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-100 text-left"><th className="p-3">Feature</th><th className="p-3 text-center">Basic</th><th className="p-3 text-center">Standard</th><th className="p-3 text-center">Premium</th></tr></thead>
          <tbody>{rows.map(([n, a, b, c]) => <tr key={n} className="border-t border-slate-200"><td className="p-3">{n}</td><td className="p-3"><Cell v={a} /></td><td className="p-3"><Cell v={b} /></td><td className="p-3"><Cell v={c} /></td></tr>)}</tbody>
        </table>
      </div></section>
      <section className="px-4 py-14"><div className="mx-auto max-w-3xl"><h2 className="mb-6 text-2xl font-bold text-slate-900">Billing questions</h2><FAQAccordion items={faq} /></div></section>
      <section className="bg-blue-600 px-4 py-14 text-center text-white">
        <h2 className="text-2xl font-bold">Running a large group of schools?</h2>
        <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-8 font-semibold text-blue-700">Talk to sales</Link>
      </section>
    </>
  );
}
