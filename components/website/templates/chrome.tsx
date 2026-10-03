import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Menu } from 'lucide-react';
import { safeVideoUrl, type TemplateId, type TemplateProps } from '@/lib/theme';

export const DARK = 'color-mix(in srgb, var(--primary) 55%, #000000)';
export const TINT = 'color-mix(in srgb, var(--primary) 7%, var(--bg))';
const opt = (u: string) => (u.includes('res.cloudinary.com') && u.includes('/image/upload/') && !u.includes('f_auto') ? u.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1400/') : u);
export const img = (v?: string | null) => (v && /^https:\/\/[^\s"'<>()]+$/.test(v) ? opt(v) : '');
export const btnCls = 'inline-flex min-h-11 items-center justify-center px-6 py-3 text-sm font-semibold uppercase tracking-wider';

export interface Opt { serif?: boolean; tracking?: string; pattern?: string; heading?: 'rule' | 'plain' | 'pill'; airy?: boolean }

export const OPTS: Record<TemplateId, Opt> = {
  modern: { serif: true },
  bold: { tracking: 'tracking-tight' },
  minimal: { tracking: 'tracking-tighter', heading: 'plain', airy: true },
  vibrant: { heading: 'pill' },
  professional: { serif: true },
  african: { tracking: 'tracking-wide', pattern: 'repeating-linear-gradient(45deg, rgba(217,119,6,.22) 0 10px, transparent 10px 20px), repeating-linear-gradient(-45deg, rgba(194,65,12,.22) 0 10px, transparent 10px 20px)' },
};

export function makeCtx(p: TemplateProps, o: Opt, pre = '') {
  const { school, courses, theme, sections } = p;
  const c = sections.content;
  const base = `/school/${encodeURIComponent(school.subdomain)}`;
  const apply = `${base}/apply`;
  const today = new Date().toISOString().slice(0, 10);
  const paras = (t?: string) => (t || '').split(/\n+/).map(s => s.trim()).filter(Boolean);
  const fmt = (d?: string) => {
    if (!d) return '';
    const t = new Date(d);
    return isNaN(t.getTime()) ? d : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  };
  const news = [...(c.news || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const events = (c.events || []).filter(e => !e.date || e.date >= today).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const staff = c.staff || [];
  const gallery = (c.gallery || []).filter(g => img(g.url));
  const hasContact = !!(school.email || school.phone || school.address);
  const showProgs = sections.courses && courses.length > 0;
  const head: CSSProperties = { fontFamily: o.serif ? 'var(--font-merriweather), Georgia, serif' : 'var(--font)' };
  const trk = o.tracking || 'tracking-tight';
  const logo = img(school.logo_url);
  const heroImg = img(c.hero_image);
  const video = theme.hero_style === 'video' ? safeVideoUrl(c.video_url || '') : '';
  const progs = courses.length || Number(c.stats.courses) || 0;

  const facts: [string, number][] = [];
  if (Number(c.stats.students) > 0) facts.push(['Students', Number(c.stats.students)]);
  if (Number(c.stats.teachers) > 0) facts.push(['Teachers', Number(c.stats.teachers)]);
  if (progs > 0) facts.push(['Programmes', progs]);
  if (Number(c.stats.years) > 1) facts.push(['Years of excellence', Number(c.stats.years)]);

  const links: [string, string][] = [];
  if (paras(c.about).length) links.push(['About', pre + '#about']);
  if (showProgs) links.push(['Programmes', pre + '#programmes']);
  if (news.length) links.push(['News', pre + '#news']);
  if (staff.length) links.push(['People', pre + '#people']);
  links.push(['Admissions', pre + '#admissions']);
  if (sections.contact && hasContact) links.push(['Contact', pre + '#contact']);

  const rad = 'var(--radius-btn)';
  const btn = (solid: boolean, dark: boolean): CSSProperties => {
    if (solid && theme.button_style === 'filled') {
      return dark ? { borderRadius: rad, background: '#ffffff', color: '#111111' } : { borderRadius: rad, background: 'var(--primary)', color: 'var(--on-primary)' };
    }
    if (theme.button_style === 'ghost') return { borderRadius: rad, color: dark ? '#ffffff' : 'var(--primary-text)', textDecoration: 'underline' };
    return { borderRadius: rad, border: `2px solid ${dark ? '#ffffff' : 'var(--primary)'}`, color: dark ? '#ffffff' : 'var(--primary-text)' };
  };
  const courseHref = (id: string | number) => `${base}/programmes/${encodeURIComponent(String(id))}`;

  return { school, courses, theme, sections, c, o, pre, base, apply, portal: '/auth/login', paras, fmt, news, events, staff, gallery, hasContact, showProgs, head, trk, logo, heroImg, video, facts, links, btn, courseHref };
}
export type X = ReturnType<typeof makeCtx>;

export function UtilityBar({ x }: { x: X }) {
  return (
    <div className="px-4 text-xs text-white/90" style={{ background: DARK }}>
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-4">
        <span className="truncate">{x.school.tagline || ''}</span>
        <Link href={x.portal} className="shrink-0 font-semibold uppercase tracking-wider">Portal login</Link>
      </div>
    </div>
  );
}

function Burger({ x, nav }: { x: X; nav: [string, string][] }) {
  return (
    <details className="relative md:hidden">
      <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center"><Menu className="h-6 w-6" /></summary>
      <div className="absolute right-0 top-12 w-56 border border-slate-200 bg-white p-2 text-slate-900 shadow-lg">
        {nav.map(([l, h]) => <a key={h} href={h} className="block min-h-11 px-3 py-3 text-sm">{l}</a>)}
        <Link href={x.apply} className="block min-h-11 px-3 py-3 text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>Apply now</Link>
        <Link href={x.portal} className="block min-h-11 px-3 py-3 text-sm">Portal login</Link>
      </div>
    </details>
  );
}

export function Header({ x, kind = 'classic' }: { x: X; kind?: 'classic' | 'centered' | 'dark' }) {
  const dark = kind === 'dark';
  const nav = x.links.slice(0, 6);
  const home = x.pre ? x.base : '#top';
  const brand = (
    <a href={home} className="flex min-w-0 items-center gap-3">
      {x.logo && <img src={x.logo} alt="" className="h-9 w-9 shrink-0 object-contain" />}
      <span className={`truncate text-lg font-bold ${x.trk}`} style={x.head}>{x.school.name}</span>
    </a>
  );
  const linkCls = `text-sm font-medium ${dark ? 'text-white/85 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`;
  return (
    <>
      <span id="top" />
      <header className={`sticky top-0 z-40 border-b px-4 ${dark ? 'border-white/10 text-white' : 'border-slate-200 bg-white text-slate-900'}`} style={dark ? { background: DARK } : undefined}>
        {kind === 'centered' ? (
          <div className="mx-auto flex max-w-6xl items-center justify-between md:flex-col md:py-5">
            <div className="flex h-16 items-center md:h-auto">{brand}</div>
            <nav className="hidden items-center gap-8 md:mt-3 md:flex">
              {nav.map(([l, h]) => <a key={h} href={h} className={linkCls}>{l}</a>)}
              <Link href={x.apply} className="text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>Apply</Link>
            </nav>
            <Burger x={x} nav={nav} />
          </div>
        ) : (
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4">
            {brand}
            <nav className="hidden items-center gap-7 md:flex">
              {nav.map(([l, h]) => <a key={h} href={h} className={linkCls}>{l}</a>)}
              <Link href={x.apply} className={btnCls} style={x.btn(true, dark)}>Apply</Link>
            </nav>
            <Burger x={x} nav={nav} />
          </div>
        )}
      </header>
    </>
  );
}

export function Hero({ x, kind = 'overlay' }: { x: X; kind?: 'overlay' | 'split' | 'plain' | 'bright' | 'pattern' }) {
  if (!x.sections.hero) return null;
  const { school, c } = x;
  const left = x.theme.hero_style === 'split' || x.theme.hero_style === 'illustrated';
  const tall = x.theme.hero_style === 'fullscreen';
  const cta = c.hero_cta || 'Apply now';
  const buttons = (dark: boolean, center: boolean, second = true) => (
    <div className={`mt-8 flex flex-wrap gap-3 ${center ? 'justify-center' : ''}`}>
      <Link href={x.apply} className={btnCls} style={x.btn(true, dark)}>{cta}</Link>
      {second && x.showProgs && <a href={x.pre + '#programmes'} className={btnCls} style={x.btn(false, dark)}>Explore programmes</a>}
    </div>
  );
  const crest = x.logo ? <img src={x.logo} alt={`${school.name} crest`} className="mb-6 h-20 w-20 object-contain" /> : null;
  const title = (cls: string) => <h1 className={`${cls} font-bold ${x.trk}`} style={x.head}>{school.name}</h1>;

  if (kind === 'overlay' || kind === 'pattern') {
    const bg = x.heroImg
      ? `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.65)), url("${x.heroImg}") center/cover`
      : kind === 'pattern' && x.o.pattern ? `${x.o.pattern}, ${DARK}` : DARK;
    const center = kind === 'pattern' || !left;
    return (
      <>
        <section className="px-4 text-white" style={{ background: bg }}>
          <div className={`mx-auto flex max-w-6xl flex-col ${center ? 'items-center text-center' : 'items-start text-left'} ${tall ? 'min-h-[85vh] justify-center py-16' : 'py-20 md:py-32'}`}>
            {crest}{title('text-4xl md:text-6xl')}
            {school.tagline && <p className="mt-4 max-w-2xl text-lg text-white/85 md:text-xl">{school.tagline}</p>}
            {buttons(true, center)}
          </div>
        </section>
        {kind === 'pattern' && <div className="h-2" style={{ background: 'var(--secondary)' }} />}
      </>
    );
  }

  if (kind === 'plain') {
    return (
      <section className="px-4 py-20 text-center md:py-32">
        <div className="mx-auto max-w-4xl">
          {x.logo && <img src={x.logo} alt={`${school.name} crest`} className="mx-auto mb-8 h-16 w-16 object-contain" />}
          {title('text-5xl md:text-7xl')}
          {school.tagline && <p className="mx-auto mt-6 max-w-2xl text-xl opacity-70">{school.tagline}</p>}
          {buttons(false, true)}
        </div>
        {x.heroImg && <img src={x.heroImg} alt="" className="mx-auto mt-14 h-64 w-full max-w-5xl object-cover md:h-96" style={{ borderRadius: 'var(--radius-card)' }} />}
      </section>
    );
  }

  if (kind === 'bright') {
    return (
      <section className="relative overflow-hidden px-4 pb-24 pt-16 md:pb-32 md:pt-24" style={{ background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '0 0 3rem 3rem' }}>
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full opacity-40" style={{ background: 'var(--secondary)' }} />
        <div className="absolute -right-8 bottom-6 h-56 w-56 rounded-full opacity-30" style={{ background: 'var(--secondary)' }} />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          {crest}{title('text-4xl md:text-6xl')}
          {school.tagline && <p className="mt-4 max-w-2xl text-lg opacity-90 md:text-xl">{school.tagline}</p>}
          {buttons(true, true, false)}
          {x.heroImg && <img src={x.heroImg} alt="" className="mt-10 h-56 w-full max-w-3xl object-cover" style={{ borderRadius: 'var(--radius-card)' }} />}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-14 md:py-20" style={{ background: TINT }}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div>
          {x.logo && <img src={x.logo} alt={`${school.name} crest`} className="mb-6 h-16 w-16 object-contain" />}
          {title('text-4xl md:text-5xl')}
          {school.tagline && <p className="mt-4 text-lg opacity-75 md:text-xl">{school.tagline}</p>}
          {buttons(false, false)}
        </div>
        {x.video ? (
          <div className="aspect-video overflow-hidden"><iframe src={x.video} title="School film" className="h-full w-full" allowFullScreen /></div>
        ) : x.heroImg ? (
          <img src={x.heroImg} alt="" className="h-72 w-full object-cover md:h-96" style={{ borderRadius: 'var(--radius-card)' }} />
        ) : (
          <div className="flex h-72 items-center justify-center md:h-96" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 'var(--radius-card)' }}>
            {x.logo && <img src={x.logo} alt="" className="h-28 w-28 object-contain" />}
          </div>
        )}
      </div>
    </section>
  );
}

export function Video({ x }: { x: X }) {
  if (!x.video) return null;
  return (
    <section className="px-4 py-14">
      <div className="mx-auto aspect-video max-w-4xl overflow-hidden"><iframe src={x.video} title="School film" className="h-full w-full" allowFullScreen /></div>
    </section>
  );
}

export function Facts({ x, kind = 'row' }: { x: X; kind?: 'row' | 'band' | 'cards' }) {
  if (!x.sections.stats || !x.facts.length) return null;
  const num = (v: number) => v.toLocaleString('en-NG');
  if (kind === 'band') {
    return (
      <section className="px-4 py-10" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-14 gap-y-6 text-center">
          {x.facts.map(([l, v]) => <div key={l}><div className="text-3xl font-bold md:text-4xl" style={x.head}>{num(v)}</div><div className="mt-1 text-xs uppercase tracking-widest opacity-80">{l}</div></div>)}
        </div>
      </section>
    );
  }
  if (kind === 'cards') {
    return (
      <section className="relative z-10 -mt-12 px-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {x.facts.map(([l, v]) => (
            <div key={l} className="bg-white p-5 text-center text-slate-900 shadow-lg" style={{ borderRadius: 'var(--radius-card)' }}>
              <div className="text-3xl font-bold" style={{ ...x.head, color: 'var(--primary-text)' }}>{num(v)}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-14 gap-y-6 text-center">
        {x.facts.map(([l, v]) => (
          <div key={l}>
            <div className="text-3xl font-bold md:text-4xl" style={{ ...x.head, color: 'var(--primary-text)' }}>{num(v)}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Footer({ x }: { x: X }) {
  if (!x.sections.footer) return null;
  return (
    <footer className="px-4 py-10 text-white" style={{ background: DARK }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {x.logo && <img src={x.logo} alt="" className="h-10 w-10 object-contain" />}
          <span className={`text-lg font-bold ${x.trk}`} style={x.head}>{x.school.name}</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
          {x.links.map(([l, h]) => <a key={h} href={h}>{l}</a>)}
          <Link href={x.portal}>Portal login</Link>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-xs text-white/60">&copy; {new Date().getFullYear()} {x.school.name}. All rights reserved.</p>
    </footer>
  );
}
