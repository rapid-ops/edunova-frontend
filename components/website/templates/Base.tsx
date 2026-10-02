import Link from 'next/link';
import type { CSSProperties } from 'react';
import { BookOpen, Award, BarChart3, Mail, ChevronDown } from 'lucide-react';
import { safeVideoUrl, type TemplateProps } from '@/lib/theme';

export interface Variant {
  headerBg: string; headerText: string; heroBg?: string; heroText?: string;
  pattern?: string; table?: boolean; tracking?: string;
}

function cardStyle(s: string): CSSProperties {
  const b: CSSProperties = { borderRadius: 'var(--radius-card)', background: '#fff', color: '#0f172a' };
  if (s === 'sharp') return { ...b, border: '2px solid #0f172a' };
  if (s === 'floating') return { ...b, boxShadow: '0 18px 40px -12px rgba(0,0,0,.25)' };
  if (s === 'glass') return { ...b, background: 'rgba(255,255,255,.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.6)' };
  if (s === 'bordered') return { ...b, border: '3px solid var(--primary)' };
  return { ...b, boxShadow: '0 4px 16px rgba(0,0,0,.08)' };
}

export default function TemplateBase({ school, courses, theme, sections, variant }: TemplateProps & { variant: Variant }) {
  const c = sections.content;
  const join = `/onboarding?school=${encodeURIComponent(school.subdomain)}`;
  const full = theme.hero_style === 'fullscreen';
  const img = /^https:\/\//.test(c.hero_image || '') ? c.hero_image : '';
  const video = theme.hero_style === 'video' ? safeVideoUrl(c.video_url || '') : '';
  const solid = variant.heroBg || (full ? 'var(--primary)' : '');
  const onDark = !!solid || !!img;
  const heroText = img ? '#ffffff' : variant.heroText || (full ? 'var(--on-primary)' : 'var(--text)');
  const heroStyle: CSSProperties = { color: heroText };
  if (img) heroStyle.background = `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)), url(${img}) center/cover`;
  else if (solid) { heroStyle.background = variant.pattern ? `${variant.pattern}, ${solid}` : solid; }

  const btn = (primary: boolean): CSSProperties => {
    const base: CSSProperties = { borderRadius: 'var(--radius-btn)', padding: '12px 24px', fontWeight: 600, display: 'inline-block', minHeight: 44 };
    const bg = onDark && primary ? '#ffffff' : 'var(--primary)';
    const fg = onDark && primary ? '#0f172a' : 'var(--on-primary)';
    if (!primary || theme.button_style === 'outlined') return { ...base, border: '2px solid currentColor', color: primary ? 'var(--primary)' : 'inherit' };
    if (theme.button_style === 'ghost') return { ...base, textDecoration: 'underline', color: 'inherit' };
    return { ...base, background: bg, color: fg };
  };

  const stats = [
    ['Students', c.stats.students], ['Courses', courses.length || c.stats.courses],
    ['Teachers', c.stats.teachers], ['Years', c.stats.years],
  ];
  const heroText$ = (
    <div className={theme.hero_style === 'split' || theme.hero_style === 'video' || theme.hero_style === 'illustrated' ? '' : 'mx-auto max-w-3xl text-center'}>
      {school.logo_url && <img src={school.logo_url} alt={`${school.name} logo`} className="mb-5 h-16 w-16 rounded-xl object-cover" style={theme.hero_style === 'split' ? {} : { margin: '0 auto 20px' }} />}
      <h1 className={`text-4xl font-bold md:text-6xl ${variant.tracking || 'tracking-tight'}`}>{school.name}</h1>
      {school.tagline && <p className="mt-4 text-lg opacity-80 md:text-xl">{school.tagline}</p>}
      <div className={`mt-8 flex flex-wrap gap-3 ${theme.hero_style === 'split' || theme.hero_style === 'video' || theme.hero_style === 'illustrated' ? '' : 'justify-center'}`}>
        <Link href={join} style={btn(true)}>{c.hero_cta || 'Join this school'}</Link>
        {sections.courses && <a href="#courses" style={btn(false)}>View courses</a>}
      </div>
    </div>
  );

  const heroSide = video ? (
    <div className="aspect-video w-full overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
      <iframe src={video} title="School video" className="h-full w-full" allowFullScreen />
    </div>
  ) : theme.hero_style === 'illustrated' ? (
    <svg viewBox="0 0 200 160" className="w-full" aria-hidden>
      <circle cx="100" cy="80" r="64" fill="var(--primary)" opacity=".25" />
      <circle cx="150" cy="40" r="22" fill="var(--secondary)" />
      <rect x="55" y="60" width="90" height="60" rx="10" fill="var(--primary)" />
      <rect x="70" y="75" width="60" height="8" rx="4" fill="#fff" />
      <rect x="70" y="92" width="40" height="8" rx="4" fill="#fff" opacity=".7" />
    </svg>
  ) : theme.hero_style === 'split' ? (
    <div className="aspect-[4/3] w-full" style={{ ...cardStyle(theme.card_style), background: 'linear-gradient(135deg,var(--primary),var(--secondary))' }} />
  ) : null;

  const Sec = ({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) => (
    <section id={id} className="px-4 py-14"><div className="mx-auto max-w-6xl">
      <h2 className={`mb-8 text-2xl font-bold md:text-3xl ${variant.tracking || 'tracking-tight'}`}>{title}</h2>{children}
    </div></section>
  );

  return (
    <div>
      <header className="px-4" style={{ background: variant.headerBg, color: variant.headerText }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <span className="flex items-center gap-2 font-bold">
            {school.logo_url && <img src={school.logo_url} alt="" className="h-8 w-8 rounded object-cover" />}{school.name}
          </span>
          <Link href={join} style={{ ...btn(true), padding: '8px 18px', background: 'var(--primary)', color: 'var(--on-primary)' }}>Join</Link>
        </div>
      </header>

      {sections.hero && (
        <section className="px-4 py-16 md:py-24" style={heroStyle}>
          <div className={`mx-auto max-w-6xl ${heroSide ? 'grid items-center gap-10 md:grid-cols-2' : ''}`}>
            {heroText$}{heroSide}
          </div>
        </section>
      )}

      {sections.stats && (
        <section className="px-4 py-10" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 text-center md:grid-cols-4">
            {stats.map(([l, v]) => <div key={String(l)}><div className="text-3xl font-bold">{v}</div><div className="text-sm opacity-80">{l}</div></div>)}
          </div>
        </section>
      )}

      {sections.features && (
        <Sec title="Why learn with us">
          <div className="grid gap-5 md:grid-cols-3">
            {[[BookOpen, 'Learn anywhere', 'Access lessons from your phone or computer, any time.'],
              [Award, 'Earn certificates', 'Complete courses and receive verifiable certificates.'],
              [BarChart3, 'Track progress', 'See grades and progress for every course in one place.']].map(([I, t, d]: any) => (
              <div key={t} className="p-6" style={cardStyle(theme.card_style)}>
                <I className="mb-3 h-7 w-7" style={{ color: 'var(--primary)' }} />
                <h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm opacity-70">{d}</p>
              </div>))}
          </div>
        </Sec>
      )}

      {sections.courses && (
        <Sec id="courses" title="Courses">
          {courses.length === 0 ? <p className="opacity-70">No published courses yet.</p> : variant.table ? (
            <div className="overflow-x-auto" style={cardStyle(theme.card_style)}>
              <table className="w-full text-left text-sm">
                <thead><tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><th className="p-3">Course</th><th className="p-3">About</th><th className="p-3" /></tr></thead>
                <tbody>{courses.map(x => (
                  <tr key={x.id} className="border-t border-slate-200"><td className="p-3 font-semibold">{x.title}</td>
                  <td className="p-3 opacity-70">{x.description || ''}</td><td className="p-3"><Link href={join} style={{ color: 'var(--primary)' }} className="font-semibold">Enroll</Link></td></tr>))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map(x => (
                <div key={x.id} className="overflow-hidden" style={cardStyle(theme.card_style)}>
                  {x.thumbnail_url && /^https:\/\//.test(x.thumbnail_url) && <img src={x.thumbnail_url} alt={x.title} className="h-36 w-full object-cover" />}
                  <div className="p-5"><h3 className="font-semibold">{x.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm opacity-70">{x.description || ''}</p>
                    <Link href={join} className="mt-3 inline-block text-sm font-semibold" style={{ color: 'var(--primary)' }}>Enroll</Link></div>
                </div>))}
            </div>
          )}
        </Sec>
      )}

      {sections.testimonials && c.testimonials.length > 0 && (
        <Sec title="What people say">
          <div className="grid gap-5 md:grid-cols-3">
            {c.testimonials.map((t, i) => (
              <div key={i} className="p-6" style={cardStyle(theme.card_style)}>
                <p className="text-sm">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-3 text-sm font-semibold">{t.name}</p><p className="text-xs opacity-60">{t.role}</p>
              </div>))}
          </div>
        </Sec>
      )}

      {sections.faq && c.faq.length > 0 && (
        <Sec title="FAQ">
          <div className="space-y-3">
            {c.faq.map((f, i) => (
              <details key={i} className="group p-4" style={cardStyle(theme.card_style)}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-semibold">{f.q}<ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary>
                <p className="mt-2 text-sm opacity-70">{f.a}</p>
              </details>))}
          </div>
        </Sec>
      )}

      {sections.contact && (
        <Sec title="Contact">
          <Link href={`/contact?school=${encodeURIComponent(school.subdomain)}`} style={btn(true)} className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />Contact {school.name}</Link>
        </Sec>
      )}

      {sections.footer && (
        <footer className="px-4 py-8 text-center text-sm" style={{ background: variant.headerBg, color: variant.headerText }}>
          &copy; {new Date().getFullYear()} {school.name}. Powered by Edunova.
        </footer>
      )}
    </div>
  );
}
