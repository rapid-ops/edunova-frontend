import Link from 'next/link';
import { Building2, BookOpen, Wallet, MessageSquare, Globe, Layers, GraduationCap, Users, Check, ArrowRight, Play, Send, ShieldCheck } from 'lucide-react';
import LoggedInRedirect from '@/components/website/LoggedInRedirect';
import Reveal from '@/components/website/Reveal';
import FAQAccordion from '@/components/website/FAQAccordion';
import SchoolShowcase from '@/components/website/SchoolShowcase';
import TestimonialsCarousel from '@/components/website/TestimonialsCarousel';
import PlatformMock from '@/components/website/PlatformMock';
import Photo, { StudentsArt } from '@/components/Photo';
import { hand } from '@/lib/hand';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';

export const metadata = {
  title: 'Edunova | Smarter Schools. Better Learning.',
  description: 'Edunova is a complete school management and learning platform designed for Nigerian schools.',
  openGraph: { title: 'Edunova | Smarter Schools. Better Learning.', description: 'Manage your school, teach, learn and stay connected in one platform.', type: 'website' },
};

async function getStats() {
  try {
    const r = await fetch(`${API}/stats/public`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    return (await r.json()) as { schools: number; students: number; teachers: number; courses: number };
  } catch { return null; }
}

const fmt = (n?: number) => (n && n > 0 ? `${n.toLocaleString('en-US')}+` : '0');

const strip = [
  [Building2, 'School Management', 'Manage students, staff, classes and more.', 'bg-violet-100 text-violet-600'],
  [BookOpen, 'Teaching & Learning', 'Courses, lessons, assignments, exams.', 'bg-emerald-100 text-emerald-600'],
  [Wallet, 'Fees & Finance', 'Track payments, manage fee structures.', 'bg-orange-100 text-orange-500'],
  [MessageSquare, 'Communication', 'Messages, notifications, parent portal.', 'bg-red-100 text-red-500'],
  [Globe, 'School Websites', 'Professional websites for your school.', 'bg-blue-100 text-blue-600'],
  [Layers, 'Multi-School Platform', 'Multiple schools, secure and scalable.', 'bg-indigo-100 text-indigo-600'],
] as const;

const roles = [
  ['schools', Building2, 'For Schools', ['Student & staff management', 'Fee & finance tracking', 'Custom school website', 'Multi-branch support'], 'Explore for Schools', 'from-emerald-200 to-lime-100', '/images/role-schools.jpg'],
  ['teachers', GraduationCap, 'For Teachers', ['Create and manage classes', 'Assign and grade work', 'Track student progress', 'Access resources'], 'Explore for Teachers', 'from-sky-200 to-blue-100', '/images/role-teachers.jpg'],
  ['students', BookOpen, 'For Students', ['Access courses and lessons', 'Submit assignments', 'Check results and attendance', 'Track your progress'], 'Explore for Students', 'from-amber-200 to-orange-100', '/images/role-students.jpg'],
  ['parents', Users, 'For Parents', ['Monitor your child\'s progress', 'View attendance & results', 'Fee payment updates', 'Stay informed'], 'Explore for Parents', 'from-rose-200 to-pink-100', '/images/role-parents.jpg'],
] as const;

const plans = [
  { name: 'Basic', price: '₦5,000', note: 'per month', items: ['Up to 100 students', 'Courses and lessons', 'Student and teacher accounts'], hi: false },
  { name: 'Standard', price: '₦15,000', note: 'per month', items: ['Up to 500 students', 'Parent portal', 'Analytics', 'WhatsApp notifications'], hi: true },
  { name: 'Premium', price: '₦30,000', note: 'per month', items: ['Unlimited students', 'AI Tutor', 'Blockchain certificates', 'Priority support'], hi: false },
];

const faq = [
  ['What is Edunova?', 'A complete school management and learning platform built for Nigerian schools.'],
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

      <section className="bg-gradient-to-b from-white to-[#f3f8ff] px-4 pb-10 pt-8 md:pt-12">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-blue-600"><GraduationCap className="h-3 w-3 text-white" /></span>
              Complete School Management &amp; Learning Platform
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0b1a4a] sm:text-5xl lg:text-6xl">
              Smarter Schools.<br />Better Learning.<br /><span className="text-[#1f63f5]">A Brighter Future.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600">
              Edunova is a complete School Management System (LMS) designed for Nigerian schools. Manage your school, teach, learn, track progress and stay connected &mdash; all in one powerful platform.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1f63f5] px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700">Get Started Free <ArrowRight className="h-4 w-4" /></Link>
              <a href="#platform" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-blue-200 bg-white px-7 text-sm font-semibold text-[#0b1a4a] hover:bg-blue-50"><Play className="h-4 w-4 rounded-full border border-blue-600 p-0.5 text-blue-600" /> Watch Demo</a>
            </div>
            <p className="mt-4 text-xs text-slate-500">No credit card required &nbsp;&bull;&nbsp; Setup in minutes</p>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-x-4 bottom-0 top-8 rounded-[40%_60%_55%_45%/50%_45%_55%_50%] bg-gradient-to-br from-blue-100 to-blue-50" />
            <p className={`${hand.className} absolute right-0 top-0 z-10 -rotate-6 text-2xl leading-6 text-[#0b1a4a]`}>
              Empowering<br />Nigerian Schools
              <svg viewBox="0 0 160 10" className="mt-1 w-32"><path d="M2 7c40-6 90-6 156-2" stroke="#1f63f5" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
            </p>
            <div className="relative z-[1] pt-10">
              <Photo src="/images/hero-students.png" alt="Nigerian students holding books and a tablet" className="mx-auto max-h-[430px] w-auto object-contain" fallback={<StudentsArt className="mx-auto h-[400px] w-auto" />} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-10"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
        {strip.map(([I, t, d, c], i) => (
          <div key={t} className={`px-4 text-center lg:text-left ${i > 0 ? 'lg:border-l lg:border-slate-100' : ''}`}>
            <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl lg:mx-0 ${c}`}><I className="h-6 w-6" /></span>
            <h3 className="mt-3 text-sm font-bold text-[#0b1a4a]">{t}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{d}</p>
          </div>
        ))}
      </div></section>

      <section id="platform" className="bg-[#eef5ff] px-4 py-16"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.5fr]">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">All-in-one platform</p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-[#0b1a4a]">Everything Your School Needs in One Place</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">Edunova brings together all the tools you need to run a modern school &mdash; from administration to learning, finance, and communication.</p>
          <ul className="mt-6 space-y-3">
            {['Easy to use and setup', 'Secure and reliable', 'Works on all devices', 'Built for Nigerian schools'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-slate-700"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600"><Check className="h-3 w-3 text-white" /></span>{t}</li>
            ))}
          </ul>
        </Reveal>
        <div className="pb-8"><PlatformMock /></div>
      </div></section>

      <section className="bg-white px-4 py-16"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_2.2fr]">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Built for everyone</p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-[#0b1a4a]">Tailored for Every Member of Your School Community</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">Whether you&apos;re a student, teacher, parent or school administrator, Edunova gives you the tools you need to succeed.</p>
          <Link href="/features" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#1f63f5] px-5 text-sm font-semibold text-white hover:bg-blue-700">Learn More <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map(([id, I, t, pts, cta, grad, img], i) => (
            <Reveal key={id} delay={i * 0.05}>
              <div id={id} className="h-full scroll-mt-24 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-md">
                <div className={`relative h-28 bg-gradient-to-br ${grad}`}>
                  <Photo src={img} alt={t} className="h-28 w-full object-cover" fallback={<div className="flex h-28 items-center justify-center"><I className="h-10 w-10 text-white/80" /></div>} />
                </div>
                <div className="p-4">
                  <div className="relative z-10 -mt-9 mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow"><I className="h-5 w-5" /></div>
                  <h3 className="text-sm font-bold text-[#0b1a4a]">{t}</h3>
                  <ul className="mt-3 space-y-1.5">{pts.map((p) => <li key={p} className="flex items-start gap-2 text-[11px] text-slate-600"><Check className="mt-0.5 h-3 w-3 shrink-0 text-blue-600" />{p}</li>)}</ul>
                  <Link href="/features" className="mt-4 flex min-h-9 items-center justify-center gap-1 rounded-md border border-blue-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">{cta} <ArrowRight className="h-3 w-3" /></Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div></section>

      <section className="px-4 pb-6"><div className="mx-auto grid max-w-7xl items-center gap-6 rounded-3xl bg-[#eef5ff] p-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Trusted by schools across Nigeria</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0b1a4a]">Join the Growing Edunova Community</h2>
          <p className="mt-2 text-sm text-slate-600">Thousands of students, teachers and schools are already building a better future with Edunova.</p>
        </div>
        <div className={`grid grid-cols-2 gap-6 text-center sm:grid-cols-4 ${stats ? "" : "hidden"}`}>
          {[[Building2, fmt(stats?.schools), 'Active Schools'], [Users, fmt(stats?.students), 'Students'], [GraduationCap, fmt(stats?.teachers), 'Teachers'], [BookOpen, fmt(stats?.courses), 'Courses & Growing']].map(([I, v, l]) => {
            const Icon = I as typeof Building2;
            return (
              <div key={l as string}>
                <Icon className="mx-auto h-5 w-5 text-blue-600" />
                <div className="mt-2 text-2xl font-extrabold text-[#0b1a4a]">{v as string}</div>
                <div className="text-xs text-slate-500">{l as string}</div>
              </div>
            );
          })}
        </div>
      </div></section>

      <section className="bg-white px-4 py-16"><div className="mx-auto max-w-7xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0b1a4a]">Schools on Edunova</h2></Reveal>
        <SchoolShowcase />
      </div></section>
<section className="bg-white px-4 py-16"><div className="mx-auto max-w-7xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0b1a4a]">Schools on Edunova</h2></Reveal>
        <SchoolShowcase />
      </div></section>

      <section className="bg-[#f6f9ff] px-4 py-16"><div className="mx-auto max-w-7xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0b1a4a]">What schools say</h2></Reveal>
        <TestimonialsCarousel />
      </div></section>

      <section className="bg-white px-4 py-16"><div className="mx-auto max-w-7xl">
        <Reveal><h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0b1a4a]">Simple pricing</h2></Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl bg-white p-6 ${p.hi ? 'border-2 border-blue-600 shadow-lg' : 'border border-slate-200'}`}>
              {p.hi && <div className="mb-2 text-xs font-bold uppercase text-blue-600">Recommended</div>}
              <h3 className="text-lg font-semibold text-[#0b1a4a]">{p.name}</h3>
              <div className="mt-2 text-3xl font-bold text-[#0b1a4a]">{p.price}</div><div className="text-sm text-slate-500">{p.note}</div>
              <ul className="my-5 space-y-2">{p.items.map((i) => <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-emerald-500" />{i}</li>)}</ul>
              <Link href="/register" className={`flex min-h-11 items-center justify-center rounded-lg font-semibold ${p.hi ? 'bg-[#1f63f5] text-white' : 'border border-slate-300 text-slate-700'}`}>Get Started</Link>
            </div>
          ))}
        </div>
      </div></section>

      <section className="bg-[#f6f9ff] px-4 py-16"><div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight text-[#0b1a4a]">Questions</h2>
        <FAQAccordion items={faq} />
      </div></section>

      <section className="px-4 py-10"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-2xl bg-[#1553e0] px-8 py-8 text-white md:flex-row">
        <div className="flex items-center gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15"><Send className="h-6 w-6" /></span>
          <div>
            <h2 className="text-xl font-bold">Ready to Transform Your School?</h2>
            <p className="mt-1 text-sm text-blue-100">Get started today and experience the future of education in Nigeria.</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/register" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-blue-700">Get Started Free <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/contact" className="inline-flex min-h-11 items-center rounded-lg border border-white/70 px-6 text-sm font-semibold text-white hover:bg-white/10">Contact Us</Link>
        </div>
      </div></section>
    </>
  );
}
