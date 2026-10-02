import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Mail, Phone, MapPin, ChevronDown, CalendarDays } from 'lucide-react';
import type { Course } from '@/lib/theme';
import { TINT, DARK, img, btnCls, type X } from './chrome';

export function Sec({ x, id, title, tint, children }: { x: X; id?: string; title: string; tint?: boolean; children: ReactNode }) {
  const h = x.o.heading || 'rule';
  const bar = h === 'plain' ? null : h === 'pill'
    ? <div className="mt-3 h-1.5 w-16 rounded-full" style={{ background: 'var(--secondary)' }} />
    : <div className="mt-3 h-0.5 w-12" style={{ background: 'var(--primary)' }} />;
  return (
    <section id={id} className={`scroll-mt-20 px-4 ${x.o.airy ? 'py-20 md:py-28' : 'py-14 md:py-20'}`} style={tint && !x.o.airy ? { background: TINT } : undefined}>
      <div className="mx-auto max-w-6xl">
        <div className={`mb-10 ${h === 'plain' ? 'text-center' : ''}`}>
          <h2 className={`text-2xl font-bold md:text-3xl ${x.trk}`} style={x.head}>{title}</h2>
          {bar}
        </div>
        {children}
      </div>
    </section>
  );
}

export function About({ x }: { x: X }) {
  const ps = x.paras(x.c.about);
  if (!ps.length) return null;
  return (
    <Sec x={x} id="about" title={`About ${x.school.name}`}>
      <div className={`max-w-3xl space-y-4 text-lg leading-relaxed ${x.o.heading === 'plain' ? 'mx-auto' : ''}`}>{ps.map((t, i) => <p key={i}>{t}</p>)}</div>
    </Sec>
  );
}

export function Programmes({ x, kind = 'list' }: { x: X; kind?: 'list' | 'table' | 'cards' | 'rows' | 'numbered' }) {
  if (!x.showProgs) return null;
  const cs = x.courses;
  const more = (k: Course) => <Link href={x.courseHref(k.id)} className="mt-2 inline-block text-sm font-semibold underline" style={{ color: 'var(--primary)' }}>View programme</Link>;
  return (
    <Sec x={x} id="programmes" title="Programmes" tint>
      {kind === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b-2" style={{ borderColor: 'var(--primary)' }}><th className="py-3 pr-4">Programme</th><th className="py-3 pr-4">About</th><th /></tr></thead>
            <tbody>{cs.map(k => (
              <tr key={k.id} className="border-b border-slate-300 align-top">
                <td className="py-3 pr-4 font-semibold">{k.title}</td>
                <td className="py-3 pr-4 opacity-75">{k.description || ''}</td>
                <td className="py-3"><Link href={x.courseHref(k.id)} className="font-semibold underline" style={{ color: 'var(--primary)' }}>View</Link></td>
              </tr>))}
            </tbody>
          </table>
        </div>
      ) : kind === 'cards' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cs.map(k => (
            <div key={k.id} className="overflow-hidden bg-white text-slate-900 shadow-md" style={{ borderRadius: 'var(--radius-card)' }}>
              {img(k.thumbnail_url)
                ? <img src={img(k.thumbnail_url)} alt="" className="h-36 w-full object-cover" />
                : <div className="h-36" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }} />}
              <div className="p-5">
                <h3 className="text-lg font-semibold" style={x.head}>{k.title}</h3>
                {k.description && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{k.description}</p>}
                {more(k)}
              </div>
            </div>))}
        </div>
      ) : kind === 'rows' ? (
        <div className="mx-auto max-w-3xl divide-y divide-slate-300">
          {cs.map(k => (
            <Link key={k.id} href={x.courseHref(k.id)} className="flex items-center justify-between gap-4 py-5">
              <span>
                <span className="block text-lg font-semibold" style={x.head}>{k.title}</span>
                {k.description && <span className="mt-1 block line-clamp-1 text-sm opacity-70">{k.description}</span>}
              </span>
              <span aria-hidden style={{ color: 'var(--primary)' }}>&rarr;</span>
            </Link>))}
        </div>
      ) : kind === 'numbered' ? (
        <div className="grid gap-6 md:grid-cols-2">
          {cs.map((k, i) => (
            <div key={k.id} className="flex gap-5 border-l-4 py-2 pl-5" style={{ borderColor: 'var(--primary)' }}>
              <div className="text-4xl font-bold" style={{ ...x.head, color: 'var(--secondary)' }}>{String(i + 1).padStart(2, '0')}</div>
              <div>
                <h3 className="text-lg font-semibold" style={x.head}>{k.title}</h3>
                {k.description && <p className="mt-1 line-clamp-2 text-sm opacity-75">{k.description}</p>}
                {more(k)}
              </div>
            </div>))}
        </div>
      ) : (
        <ul className="grid gap-x-12 md:grid-cols-2">
          {cs.map(k => (
            <li key={k.id} className="border-t border-slate-300 py-5">
              <h3 className="text-lg font-semibold" style={x.head}>{k.title}</h3>
              {k.description && <p className="mt-1 line-clamp-2 text-sm opacity-75">{k.description}</p>}
              {more(k)}
            </li>))}
        </ul>
      )}
    </Sec>
  );
}

export function News({ x, kind = 'cards' }: { x: X; kind?: 'cards' | 'rows' }) {
  if (!x.news.length) return null;
  const body = (t: string) => x.paras(t).length ? (
    <details className="mt-2">
      <summary className="min-h-11 cursor-pointer list-none py-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>Read more</summary>
      <div className="space-y-2 text-sm leading-relaxed">{x.paras(t).map((p, i) => <p key={i}>{p}</p>)}</div>
    </details>
  ) : null;
  return (
    <Sec x={x} id="news" title="News">
      {kind === 'rows' ? (
        <div className="mx-auto max-w-3xl divide-y divide-slate-300">
          {x.news.map((n, i) => (
            <article key={i} className="py-5">
              <div className="text-xs uppercase tracking-widest opacity-60">{x.fmt(n.date)}</div>
              <h3 className="mt-1 text-lg font-semibold" style={x.head}>{n.title}</h3>
              {body(n.body)}
            </article>))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {x.news.map((n, i) => (
            <article key={i} className="overflow-hidden bg-white text-slate-900 shadow-md" style={{ borderRadius: 'var(--radius-card)' }}>
              {img(n.image) && <img src={img(n.image)} alt="" className="h-44 w-full object-cover" />}
              <div className="p-5">
                <div className="text-xs uppercase tracking-widest text-slate-500">{x.fmt(n.date)}</div>
                <h3 className="mt-1 text-lg font-semibold" style={x.head}>{n.title}</h3>
                {body(n.body)}
              </div>
            </article>))}
        </div>
      )}
    </Sec>
  );
}

export function Events({ x, side }: { x: X; side?: boolean }) {
  if (!x.events.length) return null;
  const rows = x.events.map((e, i) => {
    const d = e.date ? new Date(e.date) : null;
    return (
      <li key={i} className="flex gap-4 py-3">
        <div className="w-16 shrink-0 text-center">
          <div className="text-2xl font-bold leading-none" style={{ ...x.head, color: 'var(--primary)' }}>{d ? d.getUTCDate() : ''}</div>
          <div className="text-xs uppercase tracking-widest opacity-60">{d ? d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }) : ''}</div>
        </div>
        <div><div className="font-semibold">{e.title}</div>{e.place && <div className="text-sm opacity-70">{e.place}</div>}</div>
      </li>
    );
  });
  if (side) {
    return (
      <div className="border border-slate-300 bg-white p-5 text-slate-900">
        <h3 className="mb-2 flex items-center gap-2 font-semibold" style={x.head}><CalendarDays className="h-4 w-4" />Upcoming events</h3>
        <ul className="divide-y divide-slate-200">{rows}</ul>
      </div>
    );
  }
  return <Sec x={x} id="events" title="Upcoming events"><ul className="max-w-3xl divide-y divide-slate-300">{rows}</ul></Sec>;
}

export function Staff({ x, kind = 'grid' }: { x: X; kind?: 'grid' | 'round' | 'cards' }) {
  if (!x.staff.length) return null;
  const ini = (n: string) => n.split(/\s+/).map(w => w[0] || '').slice(0, 2).join('').toUpperCase();
  const photo = (s: { name: string; photo: string }, cls: string) => img(s.photo)
    ? <img src={img(s.photo)} alt={s.name} className={`${cls} object-cover`} />
    : <div className={`${cls} flex items-center justify-center font-bold`} style={{ background: 'var(--primary)', color: 'var(--on-primary)' } as CSSProperties}>{ini(s.name)}</div>;
  return (
    <Sec x={x} id="people" title="Leadership & staff" tint>
      {kind === 'round' ? (
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {x.staff.map((s, i) => <div key={i} className="text-center">{photo(s, 'mx-auto h-28 w-28 rounded-full')}<div className="mt-3 font-semibold">{s.name}</div><div className="text-sm opacity-70">{s.role}</div></div>)}
        </div>
      ) : kind === 'cards' ? (
        <div className="grid gap-5 md:grid-cols-2">
          {x.staff.map((s, i) => (
            <div key={i} className="flex gap-4 border-t-4 bg-white p-5 text-slate-900 shadow-sm" style={{ borderColor: 'var(--primary)' }}>
              {photo(s, 'h-20 w-20 shrink-0')}
              <div><div className="font-semibold" style={x.head}>{s.name}</div><div className="text-sm text-slate-600">{s.role}</div>{s.bio && <p className="mt-1 line-clamp-3 text-sm text-slate-600">{s.bio}</p>}</div>
            </div>))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {x.staff.map((s, i) => (
            <div key={i}>{photo(s, 'aspect-[4/5] w-full')}
              <div className="mt-3 font-semibold" style={x.head}>{s.name}</div><div className="text-sm opacity-70">{s.role}</div>
              {s.bio && <p className="mt-1 line-clamp-3 text-sm opacity-70">{s.bio}</p>}
            </div>))}
        </div>
      )}
    </Sec>
  );
}

export function Gallery({ x, kind = 'grid' }: { x: X; kind?: 'grid' | 'masonry' }) {
  if (!x.gallery.length) return null;
  return (
    <Sec x={x} id="gallery" title="Gallery">
      {kind === 'masonry' ? (
        <div className="columns-2 gap-3 md:columns-3">
          {x.gallery.map((g, i) => <img key={i} src={img(g.url)} alt={g.caption} className="mb-3 w-full" style={{ borderRadius: 'var(--radius-card)' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {x.gallery.map((g, i) => <img key={i} src={img(g.url)} alt={g.caption} className="aspect-square w-full object-cover" />)}
        </div>
      )}
    </Sec>
  );
}

export function Admissions({ x, side }: { x: X; side?: boolean }) {
  const ps = x.paras(x.c.admissions);
  const cta = x.c.hero_cta || 'Apply now';
  if (side) {
    return (
      <div id="admissions" className="scroll-mt-20 p-5 text-white" style={{ background: DARK }}>
        <h3 className="font-semibold" style={x.head}>Admissions</h3>
        {ps[0] && <p className="mt-2 line-clamp-4 text-sm text-white/85">{ps[0]}</p>}
        <div className="mt-4 flex flex-col gap-2">
          <Link href={x.apply} className={btnCls} style={x.btn(true, true)}>{cta}</Link>
          <Link href={x.portal} className={btnCls} style={x.btn(false, true)}>Portal login</Link>
        </div>
      </div>
    );
  }
  return (
    <Sec x={x} id="admissions" title="Admissions">
      {ps.length > 0 && <div className="mb-8 max-w-3xl space-y-4 text-lg leading-relaxed">{ps.map((t, i) => <p key={i}>{t}</p>)}</div>}
      <div className="flex flex-wrap gap-3">
        <Link href={x.apply} className={btnCls} style={x.btn(true, false)}>{cta}</Link>
        <Link href={x.portal} className={btnCls} style={x.btn(false, false)}>Student portal login</Link>
      </div>
    </Sec>
  );
}

export function Testimonials({ x }: { x: X }) {
  if (!x.sections.testimonials || !x.c.testimonials.length) return null;
  return (
    <Sec x={x} title="Voices from our community" tint>
      <div className="grid gap-8 md:grid-cols-2">
        {x.c.testimonials.map((t, i) => (
          <blockquote key={i} className="border-l-4 pl-5" style={{ borderColor: 'var(--primary)' }}>
            <p className="text-lg italic leading-relaxed" style={x.head}>&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-3 text-sm font-semibold">{t.name}{t.role && <span className="font-normal opacity-60"> · {t.role}</span>}</footer>
          </blockquote>))}
      </div>
    </Sec>
  );
}

export function Faq({ x }: { x: X }) {
  if (!x.sections.faq || !x.c.faq.length) return null;
  return (
    <Sec x={x} title="Frequently asked questions">
      <div className="max-w-3xl">
        {x.c.faq.map((f, i) => (
          <details key={i} className="group border-t border-slate-300 py-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">{f.q}<ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" /></summary>
            <p className="mt-2 opacity-80">{f.a}</p>
          </details>))}
      </div>
    </Sec>
  );
}

export function Contact({ x, side }: { x: X; side?: boolean }) {
  if (!x.sections.contact || !x.hasContact) return null;
  const { school } = x;
  const items = (
    <ul className="space-y-4 text-lg">
      {school.address && <li className="flex gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} /><span>{school.address}</span></li>}
      {school.phone && <li className="flex gap-3"><Phone className="mt-1 h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} /><a href={`tel:${school.phone}`}>{school.phone}</a></li>}
      {school.email && <li className="flex gap-3"><Mail className="mt-1 h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} /><a href={`mailto:${school.email}`} className="break-all">{school.email}</a></li>}
    </ul>
  );
  if (side) {
    return (
      <div id="contact" className="scroll-mt-20 border border-slate-300 bg-white p-5 text-slate-900">
        <h3 className="mb-3 font-semibold" style={x.head}>Contact</h3>{items}
      </div>
    );
  }
  return <Sec x={x} id="contact" title="Contact" tint>{items}</Sec>;
}
