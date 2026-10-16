import Link from 'next/link';
import { Caveat } from 'next/font/google';
import { Users, Bot, BadgeCheck, HeartHandshake, BarChart3, MessageCircle, Check, ArrowRight, GraduationCap, BookOpen, ShieldCheck, Layers } from 'lucide-react';
import LoggedInRedirect from '@/components/website/LoggedInRedirect';
import Reveal from '@/components/website/Reveal';
import StatsCounter from '@/components/website/StatsCounter';
import FAQAccordion from '@/components/website/FAQAccordion';
import SchoolShowcase from '@/components/website/SchoolShowcase';
import TestimonialsCarousel from '@/components/website/TestimonialsCarousel';
import HeroMock from '@/components/website/HeroMock';

const hand = Caveat({ subsets: ['latin'], weight: ['600'] });
const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';

export const metadata = {
  title: 'Edunova | The LMS Built for African Schools',
  description: 'Edunova is a school LMS with AI tutoring, blockchain certificates, parent portal and WhatsApp notifications, priced in Naira.',
  openGraph: { title: 'Edunova | The LMS Built for African Schools', description: 'Run your school online with Edunova.', type: 'website' },
};

async function getStats() {
  try {
    const r = await fetch(`${API}/stats/public`, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    return (await r.json()) as { schools: number; students: number; teachers: number; courses: number };
  } catch { return null; }
}

const strip = [
  [Users, 'Multi-role access'], [Bot, 'AI Tutor'], [BadgeCheck, 'Blockchain certificates'],
  [HeartHandshake, 'Parent portal'], [BarChart3, 'Smart analytics'], [MessageCircle, 'WhatsApp alerts'],
] as const;

const needs = [
  [Layers, 'Courses and lessons', 'Publish lessons, quizzes and assignments in minutes.', ['Lesson builder', 'Quizzes and grading', 'Progress tracking']],
  [HeartHandshake, 'Parents and fees', 'Collect fees in Naira and keep parents informed.', ['Paystack payments', 'Grades and attendance', 'WhatsApp updates']],
  [ShieldCheck, 'Certificates and trust', 'Issue certificates anyone can verify online.', ['Blockchain verification', 'Branded designs', 'One-click share']],
] as const;

const members = [
  [ShieldCheck, 'School Admins', 'Manage staff, classes, fees and your public school page.'],
  [GraduationCap, 'Teachers', 'Build courses, mark work and spot struggling students early.'],
  [BookOpen, 'Students', 'Learn at your pace with an AI Tutor ready to help.'],
  [HeartHandshake, 'Parents', 'Follow grades, attendance and fees from your phone.'],
] as const;

const plans = [
  { name: 'Basic', price: '₦5,000', note: 'per month', items: ['Up to 100 students', 'Courses and lessons', 'Student and teacher accounts'], hi: false },
  { name: 'Standard', price: '₦15,000', note: 'per month', items: ['Up to 500 students', 'Parent portal', 'Analytics', 'WhatsApp notifications'], hi: true },
  { name: 'Premium', price: '₦30,000', note: 'per month', items: ['Unlimited students', 'AI Tutor', 'Blockchain certificates', 'Priority support'], hi: false },
];

const faq = [
  ['What is Edunova?', 'A learning management system built for Nigerian and African schools.'],
  ['How do I get started?', 'Register your school, choose a subdomain, and invite your teachers and students.'],
  ['Does every school get its own page?', 'Yes. Each school gets a public page you can brand from the dashboard.'],
  ['Can parents use it?', 'Yes. The parent portal shows grades, attendance and fees.'],
  ['How do certificates work?', 'Certificates are issued on completion and can be verified online.'],
  ['What does it cost?', 'Plans start at ₦5,000 per month and scale with your student count.'],
  ['Can I customize how my school looks?', 'Yes. Pick a template, colors and fonts in the Website Builder.'],
  ['How do I get support?', 'Use the support section in your dashboard or the contact page.'],
].map(([q, a]) => ({ q, a }));

export default async function Home() {
  const stats = await getStats();
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
            <p className={`${hand.className} mb-2 text-2xl text-blue-600`}>Teach. Learn. Grow.</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">The LMS Built for African Schools</h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">Run classes, results, fees and parent updates from one platform, priced in Naira.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">Get Started <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-6 font-semibold text-slate-700">See how it works</a>
            </div>
          </div>
          <HeroMock />
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white px-4 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-6">
          {strip.map(([I, t]) => (
            <div key={t} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50"><I className="h-5 w-5 text-blue-600" /></span>
              <span className="text-sm font-medium text-slate-700">{t}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16"><div className="mx-auto max-w-6xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">Everything Your School Needs</h2></Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {needs.map(([I, t, d, pts], i) => (
            <Reveal key={t} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 h-2 w-1/3 rounded bg-blue-200" />
                  <div className="mb-2 h-2 w-full rounded bg-slate-200" />
                  <div className="mb-3 h-2 w-4/5 rounded bg-slate-200" />
                  <div className="flex gap-2"><div className="h-8 flex-1 rounded bg-blue-600/80" /><div className="h-8 flex-1 rounded bg-emerald-400/80" /><div className="h-8 flex-1 rounded bg-amber-300" /></div>
                </div>
                <I className="mb-2 h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">{t}</h3>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
                <ul className="mt-3 space-y-1">{pts.map((p) => <li key={p} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-emerald-500" />{p}</li>)}</ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div></section>

      <section className="bg-slate-50 px-4 py-16"><div className="mx-auto max-w-6xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">Tailored for Every Member</h2></Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map(([I, t, d], i) => (
            <Reveal key={t} delay={i * 0.05}>
              <div className="h-full rounded-2xl bg-white p-6 text-center shadow-sm">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600"><I className="h-6 w-6 text-white" /></span>
                <h3 className="font-semibold text-slate-900">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div></section>

      <section className="bg-blue-600 px-4 py-12 text-white"><div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">Join a growing community</h2>
        <StatsCounter items={[
          { label: 'Schools', value: stats?.schools ?? 0 },
          { label: 'Students', value: stats?.students ?? 0 },
          { label: 'Teachers', value: stats?.teachers ?? 0 },
          { label: 'Courses', value: stats?.courses ?? 0 },
        ]} />
      </div></section>

      <section id="how" className="bg-white px-4 py-16"><div className="mx-auto max-w-6xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">Schools on Edunova</h2></Reveal>
        <SchoolShowcase />
      </div></section>

      <section className="bg-slate-50 px-4 py-16"><div className="mx-auto max-w-6xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">What schools say</h2></Reveal>
        <TestimonialsCarousel />
      </div></section>

      <section className="bg-white px-4 py-16"><div className="mx-auto max-w-6xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">Simple pricing</h2></Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl bg-white p-6 ${p.hi ? 'border-2 border-blue-600 shadow-lg' : 'border border-slate-200'}`}>
              {p.hi && <div className="mb-2 text-xs font-bold uppercase text-blue-600">Recommended</div>}
              <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
              <div className="mt-2 text-3xl font-bold text-slate-900">{p.price}</div><div className="text-sm text-slate-500">{p.note}</div>
              <ul className="my-5 space-y-2">{p.items.map((i) => <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-emerald-500" />{i}</li>)}</ul>
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
        <Link href="/register" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-white px-8 font-semibold text-blue-700">Get Started</Link>
      </section>
    </>
  );
}
