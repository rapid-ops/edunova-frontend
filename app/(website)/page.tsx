import Link from 'next/link';
import { Users, Bot, BadgeCheck, HeartHandshake, BarChart3, MessageCircle, Check, ArrowRight } from 'lucide-react';
import LoggedInRedirect from '@/components/website/LoggedInRedirect';
import Reveal from '@/components/website/Reveal';
import StatsCounter from '@/components/website/StatsCounter';
import FAQAccordion from '@/components/website/FAQAccordion';
import HeroMock from '@/components/website/HeroMock';

export const metadata = {
  title: 'Edunova | The LMS Built for African Schools',
  description: 'Edunova is a school LMS with AI tutoring, blockchain certificates, parent portal and WhatsApp notifications, priced in Naira.',
  openGraph: { title: 'Edunova | The LMS Built for African Schools', description: 'Run your school online with Edunova.', type: 'website' },
};

const features = [
  [Users, 'Multi-role access', 'Admins, teachers, students and parents each get their own dashboard.'],
  [Bot, 'AI Tutor', 'Students get instant help on lessons, any time of day.'],
  [BadgeCheck, 'Blockchain certificates', 'Issue certificates that anyone can verify.'],
  [HeartHandshake, 'Parent portal', 'Parents follow grades, attendance and fees in one place.'],
  [BarChart3, 'Smart analytics', 'Spot struggling students early with clear progress data.'],
  [MessageCircle, 'WhatsApp notifications', 'Reach families where they already are.'],
] as const;

const steps = [
  ['Register your school', 'Create your school and pick your subdomain in minutes.'],
  ['Invite teachers & students', 'Import your people and assign classes and courses.'],
  ['Start learning', 'Publish lessons, quizzes and assignments right away.'],
];

const plans = [
  { name: 'Basic', price: 'Free', note: 'For small schools starting out', items: ['Core LMS', 'Courses and lessons', 'Student and teacher accounts'], hi: false },
  { name: 'Standard', price: '₦15,000', note: 'per month', items: ['Everything in Basic', 'Parent portal', 'Analytics', 'WhatsApp notifications'], hi: true },
  { name: 'Premium', price: '₦35,000', note: 'per month', items: ['Everything in Standard', 'AI Tutor', 'Blockchain certificates', 'Priority support'], hi: false },
];

const faq = [
  ['What is Edunova?', 'A learning management system built for Nigerian and African schools.'],
  ['How do I get started?', 'Register your school, choose a subdomain, and invite your teachers and students.'],
  ['Does every school get its own page?', 'Yes. Each school gets a public page you can brand from the dashboard.'],
  ['Can parents use it?', 'Yes. The parent portal shows grades, attendance and fees.'],
  ['How do certificates work?', 'Certificates are issued on completion and can be verified online.'],
  ['What does it cost?', 'Basic is free. Standard is ₦15,000 and Premium is ₦35,000 per month.'],
  ['Can I customize how my school looks?', 'Yes. Pick a template, colors and fonts in the Website Builder.'],
  ['How do I get support?', 'Use the support section in your dashboard or the contact page.'],
].map(([q, a]) => ({ q, a }));

export default async function Home() {
  const ld = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'Organization', name: 'Edunova', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://edunova-frontend-gkaj.vercel.app' },
      { '@type': 'SoftwareApplication', name: 'Edunova', applicationCategory: 'EducationalApplication', operatingSystem: 'Web' },
    ],
  };
  return (
    <>
      <LoggedInRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">The LMS Built for African Schools</h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">Run classes, results, fees and parent updates from one platform, priced in Naira.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">Start Free Trial <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-6 font-semibold text-slate-700">See how it works</a>
            </div>
          </div>
          <HeroMock />
        </div>
      </section>

      <section className="bg-blue-600 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <StatsCounter items={[{ label: 'Feature tiers', value: 7 }, { label: 'Website templates', value: 6 }, { label: 'User roles', value: 4 }, { label: 'Starting price', value: 0, prefix: '₦' }]} />
        </div>
      </section>

      <section className="px-4 py-16"><div className="mx-auto max-w-6xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">Everything your school needs</h2></Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(([I, t, d], i) => (
            <Reveal key={t} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <I className="mb-4 h-8 w-8 text-blue-600" /><h3 className="font-semibold text-slate-900">{t}</h3><p className="mt-1 text-slate-600">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div></section>

      <section id="how" className="bg-slate-50 px-4 py-16"><div className="mx-auto max-w-6xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">How it works</h2></Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">{i + 1}</div>
                <h3 className="font-semibold text-slate-900">{t}</h3><p className="mt-1 text-slate-600">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div></section>


      <section className="bg-slate-50 px-4 py-16"><div className="mx-auto max-w-6xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">Simple pricing</h2></Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map(p => (
            <div key={p.name} className={`rounded-2xl bg-white p-6 ${p.hi ? 'border-2 border-blue-600 shadow-lg' : 'border border-slate-200'}`}>
              {p.hi && <div className="mb-2 text-xs font-bold uppercase text-blue-600">Recommended</div>}
              <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
              <div className="mt-2 text-3xl font-bold text-slate-900">{p.price}</div><div className="text-sm text-slate-500">{p.note}</div>
              <ul className="my-5 space-y-2">{p.items.map(i => <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-emerald-500" />{i}</li>)}</ul>
              <Link href="/register" className={`flex min-h-11 items-center justify-center rounded-lg font-semibold ${p.hi ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-700'}`}>Get Started</Link>
            </div>
          ))}
        </div>
      </div></section>


      <section className="bg-slate-50 px-4 py-16"><div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-slate-900">Questions</h2>
        <FAQAccordion items={faq} />
      </div></section>

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-16 text-center text-white">
        <h2 className="text-3xl font-bold tracking-tight">Ready to transform your school?</h2>
        <Link href="/register" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-white px-8 font-semibold text-blue-700">Start Free Trial</Link>
      </section>
    </>
  );
}
