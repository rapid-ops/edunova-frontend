'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building2, ChevronDown, CircleCheck, Eye, EyeOff, GraduationCap, Headphones, Lock, Mail, Phone, Search, ShieldCheck, User, UserRound, Users, Zap } from 'lucide-react';
import api from '@/lib/api';
import Logo from '@/components/Logo';
import { Caption, LaptopArt, SocialIcon } from './art';
import { CONTACT } from '@/lib/contact';

const GID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '842943328007-1vm692lbekoqsu6nli8jsiquc560dj0p.apps.googleusercontent.com';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const iconBox = 'flex h-12 w-12 shrink-0 items-center justify-center bg-blue-50/70 text-slate-500';
const input = 'h-12 w-full min-w-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400';
const btn = 'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f63f5] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50';

type RoleKey = 'student' | 'teacher' | 'parent' | 'school_admin';
type School = { id: number; name: string; subdomain: string };
type Errors = Partial<Record<'full_name' | 'email' | 'phone' | 'password' | 'confirm' | 'role' | 'school_id', string>>;

const ROLES: { key: RoleKey; title: string; desc: string; Icon: React.ElementType; tint: string }[] = [
  { key: 'student', title: 'Student', desc: 'Access your courses, submit assignments, view results and more.', Icon: GraduationCap, tint: 'bg-blue-100 text-blue-600' },
  { key: 'teacher', title: 'Teacher', desc: 'Create classes, manage students, track progress and grade assignments.', Icon: UserRound, tint: 'bg-teal-100 text-teal-600' },
  { key: 'parent', title: 'Parent', desc: "Stay updated on your child's performance, attendance and fees.", Icon: Users, tint: 'bg-teal-100 text-teal-600' },
  { key: 'school_admin', title: 'School Administrator', desc: 'Manage your school, staff, classes, fees and more.', Icon: Building2, tint: 'bg-blue-100 text-blue-600' },
];
type Soc = 'facebook' | 'x' | 'instagram' | 'youtube';
const SOCIALS: [Soc, string][] = ([['facebook', CONTACT.facebook], ['x', CONTACT.twitter], ['instagram', CONTACT.instagram], ['youtube', CONTACT.youtube]] as [Soc, string][]).filter(([, u]) => !!u);
const CHECKS = ['Secure', 'Fast', 'Easy to use', 'Free to get started'];
const STRIP: [React.ElementType, string, string][] = [
  [ShieldCheck, 'Your data is secure', 'and protected'],
  [Zap, 'Quick and easy', 'account setup'],
  [Headphones, 'Dedicated support', 'when you need it'],
  [Users, 'Trusted by schools', 'across Nigeria'],
];

function normPhone(raw: string): string | null {
  let d = raw.replace(/[\s\-().]/g, '');
  if (d.startsWith('+234')) d = d.slice(4);
  else if (d.startsWith('234') && d.length >= 13) d = d.slice(3);
  d = d.replace(/^0/, '');
  return /^[789]\d{9}$/.test(d) ? '+234' + d : null;
}

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6C12.3 13.5 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.4 28.8A14.5 14.5 0 0 1 9.5 24c0-1.7.3-3.3.9-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.6-5.9c-2 1.4-4.7 2.3-7.6 2.3-6.3 0-11.7-4-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z"/></svg>
  );
}

function Field({ id, label, icon: Icon, error, right, children }: { id: string; label: string; icon: React.ElementType; error?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#0b1a4a]">{label} <span className="text-red-500">*</span></label>
      <div className={`flex items-center overflow-hidden rounded-xl border bg-white focus-within:ring-2 ${error ? 'border-red-400 focus-within:ring-red-100' : 'border-blue-100 focus-within:border-blue-500 focus-within:ring-blue-100'}`}>
        <span className={iconBox}><Icon className="h-4 w-4" /></span>
        {children}
        {right}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Inner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '', role: '' as '' | RoleKey });
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsErr, setSchoolsErr] = useState(false);
  const [q, setQ] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [topError, setTopError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ email: string } | null>(null);
  const wantsSchool = form.role === 'student' || form.role === 'teacher' || form.role === 'parent';
  const isAdmin = form.role === 'school_admin';

  useEffect(() => {
    api.get('/schools/public').then((r) => {
      const list: School[] = r.data.schools || [];
      setSchools(list);
      const sub = sp.get('school');
      const m = sub ? list.find((s) => s.subdomain === sub) : undefined;
      if (m) setSchoolId(m.id);
    }).catch(() => setSchoolsErr(true));
  }, [sp]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (t ? schools.filter((s) => s.name.toLowerCase().includes(t)) : schools).slice(0, 50);
  }, [q, schools]);
  const chosen = schools.find((s) => s.id === schoolId) || null;

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }) as typeof f);
    setErrors((e) => ({ ...e, [k]: undefined }) as Errors);
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (form.full_name.trim().length < 2) e.full_name = 'Enter your full name';
    if (!EMAIL.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!normPhone(form.phone)) e.phone = 'Enter a valid Nigerian phone number';
    if (!form.role) e.role = 'Select your role';
    if (!isAdmin) {
      const pw = form.password;
      if (pw.length < 8 || pw.length > 72 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) e.password = 'Use 8 or more characters with a letter and a number';
      if (form.confirm !== pw) e.confirm = 'Passwords do not match';
      if (wantsSchool && !schoolId) e.school_id = 'Choose your school';
    }
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setTopError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { setTopError('Please correct the highlighted fields.'); return; }
    const phone = normPhone(form.phone) as string;
    if (isAdmin) {
      try { sessionStorage.setItem('reg_prefill', JSON.stringify({ full_name: form.full_name.trim(), email: form.email.trim(), phone })); } catch {}
      router.push('/onboarding');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/signup', { full_name: form.full_name.trim(), email: form.email.trim(), phone, password: form.password, role: form.role, school_id: schoolId });
      setDone({ email: form.email.trim() });
    } catch (err: any) {
      const d = err.response?.data;
      if (err.response?.status === 429) setTopError('Too many attempts. Please wait a few minutes and try again.');
      else {
        if (d?.errors) {
          const m: Errors = {};
          for (const k of Object.keys(d.errors)) m[k as keyof Errors] = d.errors[k];
          setErrors(m);
        }
        setTopError(d?.error || 'Could not create your account. Check your connection and try again.');
      }
    } finally { setLoading(false); }
  };

  const google = () => {
    const p = new URLSearchParams({
      client_id: GID,
      redirect_uri: (window.location.hostname === 'localhost' ? window.location.origin : 'https://edunova-frontend-gkaj.vercel.app') + '/auth/oauth-callback',
      response_type: 'id_token', scope: 'openid email profile',
      nonce: Math.random().toString(36).slice(2), prompt: 'select_account',
    });
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + p.toString();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f4f9ff] to-[#e9f2ff]">
      <header className="bg-white/80">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Logo size={42} />
          <div className="flex items-center gap-3">
            <p className="max-w-[100px] text-right text-[11px] leading-tight text-slate-600 sm:max-w-none sm:text-sm">Already have an account?</p>
            <Link href="/auth/login" className="inline-flex h-11 items-center rounded-full border-2 border-blue-200 bg-white px-5 text-sm font-semibold text-blue-600 hover:bg-blue-50">Log In</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-6 px-4 pb-8 pt-6 sm:px-8 lg:grid-cols-2 lg:pb-12 lg:pt-10">
          <div>
            <span className="inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-600">{done ? 'Step 2 of 2' : 'Step 1 of 2'}</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-[#0b1a4a] sm:text-5xl">Create Your<br />Edunova Account</h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">Join thousands of students, teachers, parents and school administrators using Edunova to build a better future in education.</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-medium text-[#0b1a4a] sm:flex sm:flex-wrap">
              {CHECKS.map((t) => (
                <li key={t} className="flex items-center gap-2"><CircleCheck className="h-5 w-5 fill-blue-600 text-white" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <Caption lines={['Better', 'Education', 'for a Brighter', 'Future']} className="absolute right-0 top-0 z-[1] sm:right-4" />
            <LaptopArt className="mx-auto w-full" />
          </div>
        </section>

        {done ? (
          <section className="mx-auto w-full max-w-xl px-4 pb-12 sm:px-8">
            <div role="status" className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <CircleCheck className="mx-auto h-14 w-14 fill-green-500 text-white" aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-extrabold text-[#0b1a4a]">Account created</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Your school administrator must approve it before you can sign in. Once it is approved, sign in with <span className="break-all font-semibold">{done.email}</span>.</p>
              <p className="mt-2 text-xs text-slate-500">Type your email exactly as shown when you sign in.</p>
              <Link href="/auth/login" className={btn + ' mt-6'}>Back to login</Link>
            </div>
          </section>
        ) : (
          <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8">
            <form onSubmit={submit} noValidate className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#0b1a4a]">Get Started</h2>
              <p className="mt-1 text-sm text-slate-500">Fill in your details to create your account.</p>
              {topError && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{topError}</div>}
              <div className="mt-5 space-y-4">
                <Field id="full_name" label="Full Name" icon={User} error={errors.full_name}>
                  <input id="full_name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={input} placeholder="Enter your full name" autoComplete="name" aria-invalid={!!errors.full_name} />
                </Field>
                <Field id="email" label="Email Address" icon={Mail} error={errors.email}>
                  <input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={input} placeholder="you@example.com" autoComplete="email" autoCapitalize="none" autoCorrect="off" aria-invalid={!!errors.email} />
                </Field>
                <Field id="phone" label="Phone Number" icon={Phone} error={errors.phone}>
                  <input id="phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={input} placeholder="+234 801 234 5678" autoComplete="tel" aria-invalid={!!errors.phone} />
                </Field>
                {!isAdmin && (
                  <>
                    <Field id="password" label="Password" icon={Lock} error={errors.password}
                      right={<button type="button" onClick={() => setShow1(!show1)} aria-label={show1 ? 'Hide password' : 'Show password'} className="flex h-12 w-12 shrink-0 items-center justify-center text-slate-500 hover:text-slate-700">{show1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}>
                      <input id="password" type={show1 ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} className={input} placeholder="Create a strong password" autoComplete="new-password" aria-invalid={!!errors.password} />
                    </Field>
                    <Field id="confirm" label="Confirm Password" icon={Lock} error={errors.confirm}
                      right={<button type="button" onClick={() => setShow2(!show2)} aria-label={show2 ? 'Hide password' : 'Show password'} className="flex h-12 w-12 shrink-0 items-center justify-center text-slate-500 hover:text-slate-700">{show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}>
                      <input id="confirm" type={show2 ? 'text' : 'password'} value={form.confirm} onChange={(e) => set('confirm', e.target.value)} className={input} placeholder="Confirm your password" autoComplete="new-password" aria-invalid={!!errors.confirm} />
                    </Field>
                  </>
                )}
                <Field id="role" label="Account Type" icon={UserRound} error={errors.role}
                  right={<ChevronDown className="pointer-events-none mr-4 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />}>
                  <select id="role" value={form.role} onChange={(e) => set('role', e.target.value)} className={input + ' cursor-pointer appearance-none'} aria-invalid={!!errors.role}>
                    <option value="">Select your role</option>
                    {ROLES.map((r) => <option key={r.key} value={r.key}>{r.title}</option>)}
                  </select>
                </Field>
                {isAdmin && <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-slate-600">You will set up your school and choose your password on the next step.</p>}
                {wantsSchool && (
                  <div>
                    <label htmlFor="school_q" className="mb-1.5 block text-sm font-medium text-[#0b1a4a]">Your School <span className="text-red-500">*</span></label>
                    {chosen ? (
                      <div className="flex h-12 items-center justify-between rounded-xl border border-blue-500 bg-blue-50/60 px-4 text-sm font-medium text-[#0b1a4a]">
                        <span className="truncate">{chosen.name}</span>
                        <button type="button" onClick={() => { setSchoolId(null); setQ(''); }} className="ml-3 shrink-0 text-xs font-semibold text-blue-600 hover:underline">Change</button>
                      </div>
                    ) : (
                      <div className={`overflow-hidden rounded-xl border bg-white ${errors.school_id ? 'border-red-400' : 'border-blue-100'}`}>
                        <div className="flex items-center border-b border-blue-50">
                          <span className={iconBox}><Search className="h-4 w-4" /></span>
                          <input id="school_q" value={q} onChange={(e) => setQ(e.target.value)} className={input} placeholder="Search for your school" autoComplete="off" />
                        </div>
                        <ul role="listbox" aria-label="Schools" className="max-h-44 overflow-y-auto">
                          {filtered.map((s) => (
                            <li key={s.id}>
                              <button type="button" role="option" aria-selected={false} onClick={() => { setSchoolId(s.id); setErrors((x) => ({ ...x, school_id: undefined })); }} className="block min-h-[44px] w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50">{s.name}</button>
                            </li>
                          ))}
                          {!filtered.length && <li className="px-4 py-3 text-sm text-slate-500">{schoolsErr ? 'Could not load schools. Refresh and try again.' : 'No school found'}</li>}
                        </ul>
                      </div>
                    )}
                    {errors.school_id && <p className="mt-1 text-xs text-red-600">{errors.school_id}</p>}
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading} className={btn + ' mt-6'}>{loading ? 'Creating account...' : isAdmin ? 'Continue' : 'Create Account'}<ArrowRight className="h-4 w-4" /></button>
              <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs text-slate-500">or</span><div className="h-px flex-1 bg-slate-200" /></div>
              <button type="button" onClick={google} className="flex h-12 w-full items-center justify-center gap-3 rounded-full border-2 border-blue-100 bg-white text-sm font-medium text-[#0b1a4a] hover:bg-blue-50"><GoogleG />Continue with Google</button>
              <p className="mt-2 text-center text-xs text-slate-500">Google only signs you in to an account that already exists. New here? Fill in the form above.</p>
              <p className="mt-5 text-center text-xs text-slate-500">By creating an account, you agree to our <Link href="/terms" className="text-blue-600">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600">Privacy Policy</Link>.</p>
            </form>

            <aside className="rounded-2xl bg-blue-50/70 p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#0b1a4a]">Choose Your Role</h2>
              <p className="mt-1 text-sm text-slate-500">Select the type of account that best describes you.</p>
              <div role="radiogroup" aria-label="Account type" className="mt-5 space-y-3">
                {ROLES.map(({ key, title, desc, Icon, tint }) => {
                  const on = form.role === key;
                  return (
                    <button key={key} type="button" role="radio" aria-checked={on} onClick={() => set('role', key)}
                      className={`flex min-h-[76px] w-full items-center gap-4 rounded-xl border bg-white px-4 py-3 text-left transition ${on ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-blue-200'}`}>
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tint}`}><Icon className="h-6 w-6" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-[#0b1a4a]">{title}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-slate-500">{desc}</span>
                      </span>
                      <ArrowRight className={`h-4 w-4 shrink-0 ${on ? 'text-blue-600' : 'text-slate-400'}`} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              <Caption lines={['Same Platform,', 'Different Goals']} className="mx-auto mt-8 w-fit" />
            </aside>
          </section>
        )}
      </main>

      <section className="border-y border-blue-100 bg-white/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {STRIP.map(([Icon, a, b]) => (
            <div key={a} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Icon className="h-5 w-5" /></span>
              <p className="text-xs leading-snug text-slate-600">{a}<br />{b}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-8 md:flex-row">
          <Logo size={38} />
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-700">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/about" className="hover:text-blue-600">About</Link>
            <Link href="/features" className="hover:text-blue-600">Features</Link>
            <Link href="/contact" className="hover:text-blue-600">Contact</Link>
          </nav>
          <div className="flex items-center gap-2 text-[#0b1a4a]">
            {SOCIALS.map(([n, href]) => (
              <a key={n} href={href} target="_blank" rel="noopener noreferrer" aria-label={n} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-blue-50"><SocialIcon name={n} /></a>
            ))}
          </div>
        </div>
        <div className="border-t border-blue-100">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-8">
            <p>&copy; {new Date().getFullYear()} Edunova. All rights reserved.</p>
            <p className="flex items-center gap-2">Built for Nigerian Schools
              <span className="inline-flex h-3.5 w-5 overflow-hidden rounded-sm border border-slate-200"><span className="w-1/3 bg-green-600" /><span className="w-1/3 bg-white" /><span className="w-1/3 bg-green-600" /></span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f9ff]" />}>
      <Inner />
    </Suspense>
  );
}
