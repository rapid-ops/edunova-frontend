import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Mail, Phone, MapPin, Menu, ChevronDown } from 'lucide-react';
import { safeVideoUrl, type TemplateProps } from '@/lib/theme';

export interface Variant { serif?: boolean; tracking?: string; table?: boolean; pattern?: string }

const DARK = 'color-mix(in srgb, var(--primary) 55%, #000000)';
const TINT = 'color-mix(in srgb, var(--primary) 7%, var(--bg))';
const img = (v?: string | null) => (v && /^https:\/\/[^\s"'<>()]+$/.test(v) ? v : '');
const btnCls = 'inline-flex min-h-11 items-center justify-center px-6 py-3 text-sm font-semibold uppercase tracking-wider';

export default function TemplateBase({ school, courses, theme, sections, variant }: TemplateProps & { variant: Variant }) {
  const c = sections.content;
  const apply = `/onboarding?school=${encodeURIComponent(school.subdomain)}`;
  const portal = '/auth/login';
  const head: CSSProperties = { fontFamily: variant.serif ? 'var(--font-merriweather), Georgia, serif' : 'var(--font)' };
  const trk = variant.tracking || 'tracking-tight';
  const logo = img(school.logo_url);
  const heroImg = img(c.hero_image);
  const video = theme.hero_style === 'video' ? safeVideoUrl(c.video_url || '') : '';
  const left = theme.hero_style === 'split' || theme.hero_style === 'illustrated';
  const tall = theme.hero_style === 'fullscreen';
  const paras = (t?: string) => (t || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
  const hasContact = !!(school.email || school.phone || school.address);
  const progs = courses.length || c.stats.courses;
  const showProgs = sections.courses && courses.length > 0;

  const facts: [string, number][] = [];
  if (c.stats.students > 0) facts.push(['Students', c.stats.students]);
  if (c.stats.teachers > 0) facts.push(['Teachers', c.stats.teachers]);
  if (progs > 0) facts.push(['Programmes', progs]);
  if (c.stats.years > 1) facts.push(['Years of excellence', c.stats.years]);

  const links: [string, string][] = [];
  if (paras(c.about).length) links.push(['About', '#about']);
  if (showProgs) links.push(['Programmes', '#programmes']);
  links.push(['Admissions', '#admissions']);
  if (sections.contact && hasContact) links.push(['Contact', '#contact']);

  const rad = 'var(--radius-btn)';
  const btn = (solid: boolean, dark: boolean): CSSProperties => {
    if (solid && theme.button_style === 'filled') {
      return dark ? { borderRadius: rad, background: '#ffffff', color: '#111111' } : { borderRadius: rad, background: 'var(--primary)', color: 'var(--on-primary)' };
    }
    if (theme.button_style === 'ghost') return { borderRadius: rad, color: dark ? '#ffffff' : 'var(--primary)', textDecoration: 'underline' };
    return { borderRadius: rad, border: `2px solid ${dark ? '#ffffff' : 'var(--primary)'}`, color: dark ? '#ffffff' : 'var(--primary)' };
  };

  const Sec = ({ id, title, tint, children }: { id?: string; title: string; tint?: boolean; children: ReactNode }) => (
    <section id={id} className="scroll-mt-20 px-4 py-14 md:py-20" style={tint ? { background: TINT } : undefined}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className={`text-2xl font-bold md:text-3xl ${trk}`} style={head}>{title}</h2>
          <div className="mt-3 h-0.5 w-12" style={{ background: 'var(--primary)' }} />
        </div>
        {children}
      </div>
    </section>
  );

  const heroBg = heroImg
    ? `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.65)), url("${heroImg}") center/cover`
    : variant.pattern ? `${variant.pattern}, ${DARK}` : DARK;

  return (
    <div>
      <div className="px-4 text-xs text-white/90" style={{ background: DARK }}>
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-4">
          <span className="truncate">{school.tagline || ''}</span>
          <Link href={portal} className="shrink-0 font-semibold uppercase tracking-wider">Portal login</Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 text-slate-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            {logo && <img src={logo} alt="" className="h-9 w-9 shrink-0 object-contain" />}
            <span className={`truncate text-lg font-bold ${trk}`} style={head}>{school.name}</span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {links.map(([l, h]) => <a key={h} href={h} className="text-sm font-medium text-slate-700 hover:text-slate-900">{l}</a>)}
            <Link href={apply} className={btnCls} style={btn(true, false)}>Apply</Link>
          </nav>
          <details className="relative md:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center"><Menu className="h-6 w-6" /></summary>
            <div className="absolute right-0 top-12 w-56 border border-slate-200 bg-white p-2 shadow-lg">
              {links.map(([l, h]) => <a key={h} href={h} className="block min-h-11 px-3 py-3 text-sm text-slate-800">{l}</a>)}
              <Link href={apply} className="block min-h-11 px-3 py-3 text-sm font-semibold" style={{ color: 'var(--primary)' }}>Apply now</Link>
            </div>
          </details>
        </div>
      </header>

      <span id="top" />
      {sections.hero && (
        <section className="px-4 text-white" style={{ background: heroBg }}>
          <div className={`mx-auto flex max-w-6xl flex-col ${left ? 'items-start text-left' : 'items-center text-center'} ${tall ? 'min-h-[85vh] justify-center py-16' : 'py-20 md:py-32'}`}>
            {logo && <img src={logo} alt={`${school.name} crest`} className="mb-6 h-20 w-20 object-contain" />}
            <h1 className={`text-4xl font-bold md:text-6xl ${trk}`} style={head}>{school.name}</h1>
            {school.tagline && <p className="mt-4 max-w-2xl text-lg text-white/85 md:text-xl">{school.tagline}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={apply} className={btnCls} style={btn(true, true)}>{c.hero_cta || 'Apply now'}</Link>
              {showProgs && <a href="#programmes" className={btnCls} style={btn(false, true)}>Explore programmes</a>}
            </div>
          </div>
        </section>
      )}

      {sections.stats && facts.length > 0 && (
        <section className="border-b border-slate-200 bg-white px-4 py-10 text-slate-900">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-14 gap-y-6 text-center">
            {facts.map(([l, v]) => (
              <div key={l}>
                <div className="text-3xl font-bold md:text-4xl" style={{ ...head, color: 'var(--primary)' }}>{v.toLocaleString('en-NG')}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">{l}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {video && (
        <section className="px-4 py-14">
          <div className="mx-auto aspect-video max-w-4xl overflow-hidden"><iframe src={video} title="School film" className="h-full w-full" allowFullScreen /></div>
        </section>
      )}

      {paras(c.about).length > 0 && (
        <Sec id="about" title={`About ${school.name}`}>
          <div className="max-w-3xl space-y-4 text-lg leading-relaxed">{paras(c.about).map((t, i) => <p key={i}>{t}</p>)}</div>
        </Sec>
      )}

      {showProgs && (
        <Sec id="programmes" title="Programmes" tint>
          {variant.table ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b-2" style={{ borderColor: 'var(--primary)' }}><th className="py-3 pr-4">Programme</th><th className="py-3 pr-4">About</th><th /></tr></thead>
                <tbody>{courses.map(x => (
                  <tr key={x.id} className="border-b border-slate-300 align-top">
                    <td className="py-3 pr-4 font-semibold">{x.title}</td>
                    <td className="py-3 pr-4 opacity-75">{x.description || ''}</td>
                    <td className="py-3"><Link href={apply} className="font-semibold underline" style={{ color: 'var(--primary)' }}>Apply</Link></td>
                  </tr>))}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="grid gap-x-12 md:grid-cols-2">
              {courses.map(x => (
                <li key={x.id} className="border-t border-slate-300 py-5">
                  <h3 className="text-lg font-semibold" style={head}>{x.title}</h3>
                  {x.description && <p className="mt-1 line-clamp-2 text-sm opacity-75">{x.description}</p>}
                  <Link href={apply} className="mt-2 inline-block text-sm font-semibold underline" style={{ color: 'var(--primary)' }}>Apply for this programme</Link>
                </li>))}
            </ul>
          )}
        </Sec>
      )}

      <Sec id="admissions" title="Admissions">
        {paras(c.admissions).length > 0 && <div className="mb-8 max-w-3xl space-y-4 text-lg leading-relaxed">{paras(c.admissions).map((t, i) => <p key={i}>{t}</p>)}</div>}
        <div className="flex flex-wrap gap-3">
          <Link href={apply} className={btnCls} style={btn(true, false)}>{c.hero_cta || 'Apply now'}</Link>
          <Link href={portal} className={btnCls} style={btn(false, false)}>Student portal login</Link>
        </div>
      </Sec>

      {sections.testimonials && c.testimonials.length > 0 && (
        <Sec title="Voices from our community" tint>
          <div className="grid gap-8 md:grid-cols-2">
            {c.testimonials.map((t, i) => (
              <blockquote key={i} className="border-l-4 pl-5" style={{ borderColor: 'var(--primary)' }}>
                <p className="text-lg italic leading-relaxed" style={head}>&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-3 text-sm font-semibold">{t.name}{t.role && <span className="font-normal opacity-60"> · {t.role}</span>}</footer>
              </blockquote>))}
          </div>
        </Sec>
      )}

      {sections.faq && c.faq.length > 0 && (
        <Sec title="Frequently asked questions">
          <div className="max-w-3xl">
            {c.faq.map((f, i) => (
              <details key={i} className="group border-t border-slate-300 py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">{f.q}<ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" /></summary>
                <p className="mt-2 opacity-80">{f.a}</p>
              </details>))}
          </div>
        </Sec>
      )}

      {sections.contact && hasContact && (
        <Sec id="contact" title="Contact" tint>
          <ul className="space-y-4 text-lg">
            {school.address && <li className="flex gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} /><span>{school.address}</span></li>}
            {school.phone && <li className="flex gap-3"><Phone className="mt-1 h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} /><a href={`tel:${school.phone}`}>{school.phone}</a></li>}
            {school.email && <li className="flex gap-3"><Mail className="mt-1 h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} /><a href={`mailto:${school.email}`} className="break-all">{school.email}</a></li>}
          </ul>
        </Sec>
      )}

      {sections.footer && (
        <footer className="px-4 py-10 text-white" style={{ background: DARK }}>
          <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              {logo && <img src={logo} alt="" className="h-10 w-10 object-contain" />}
              <span className={`text-lg font-bold ${trk}`} style={head}>{school.name}</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
              {links.map(([l, h]) => <a key={h} href={h}>{l}</a>)}
              <Link href={portal}>Portal login</Link>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-6xl text-xs text-white/60">&copy; {new Date().getFullYear()} {school.name}. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
}
