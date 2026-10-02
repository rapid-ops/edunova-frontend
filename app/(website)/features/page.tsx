import Link from 'next/link';
import { BookOpen, Users, ClipboardCheck, Wallet, MessageCircle, Bot, ShieldCheck, Check } from 'lucide-react';

export const metadata = { title: 'Features | Edunova', description: 'Everything Edunova offers schools, from courses to AI tutoring and certificates.' };

const tiers = [
  [BookOpen, 'Tier 1: Core learning', 'Teach and learn online.', ['Courses and lessons', 'Quizzes and assignments', 'Progress tracking', 'SCORM support']],
  [Users, 'Tier 2: School operations', 'Run your school structure.', ['Classes and departments', 'Timetables', 'Attendance', 'Semesters and programs']],
  [ClipboardCheck, 'Tier 3: Results', 'Grades without the paperwork.', ['Gradebook', 'Report cards', 'Transcripts', 'Results']],
  [Wallet, 'Tier 4: Fees and payments', 'Collect fees in Naira.', ['Fee management', 'Online payments', 'Coupons', 'Subscriptions']],
  [MessageCircle, 'Tier 5: Communication', 'Keep everyone connected.', ['Announcements', 'Messages and discussions', 'Parent portal', 'WhatsApp notifications']],
  [Bot, 'Tier 6: AI and insight', 'Help every student improve.', ['AI Tutor', 'Adaptive learning', 'Analytics', 'Dropout risk alerts']],
  [ShieldCheck, 'Tier 7: Trust and credentials', 'Prove achievement.', ['Certificates', 'Blockchain verification', 'Proctored exams', 'Skill passport']],
] as const;

const compare: [string, string, string, string, string][] = [
  ['Naira pricing', 'Yes', 'No', 'No', 'No'],
  ['WhatsApp notifications', 'Yes', 'No', 'No', 'No'],
  ['Parent portal', 'Yes', 'Limited', 'Plugin', 'No'],
  ['AI Tutor', 'Yes', 'No', 'Plugin', 'No'],
  ['Blockchain certificates', 'Yes', 'No', 'No', 'No'],
];

export default function Features() {
  return (
    <>
      <section className="px-4 py-16"><div className="mx-auto max-w-5xl">
        <h1 className="mb-10 text-center text-4xl font-bold tracking-tight text-slate-900">Everything your school needs</h1>
        <div className="space-y-5">
          {tiers.map(([I, t, d, items]) => (
            <div key={t} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start gap-4">
                <I className="h-8 w-8 shrink-0 text-blue-600" />
                <div><h2 className="text-lg font-semibold text-slate-900">{t}</h2><p className="text-slate-600">{d}</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">{items.map(i => <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-emerald-500" />{i}</li>)}</ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div></section>
      <section className="bg-slate-50 px-4 py-14"><div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">How Edunova compares</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-100 text-left"><th className="p-3" /><th className="p-3">Edunova</th><th className="p-3">Google Classroom</th><th className="p-3">Moodle</th><th className="p-3">Alison</th></tr></thead>
            <tbody>{compare.map(r => <tr key={r[0]} className="border-t border-slate-200">{r.map((c, i) => <td key={i} className={`p-3 ${i === 0 ? 'font-medium' : ''}`}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div></section>
      <section className="px-4 py-14 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Built for Nigeria</h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">WhatsApp notifications, Paystack payments, Naira pricing and an app that works on any phone.</p>
        <Link href="/register" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-8 font-semibold text-white">Start Free Trial</Link>
      </section>
    </>
  );
}
