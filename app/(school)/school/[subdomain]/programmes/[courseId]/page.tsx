import { notFound } from 'next/navigation';
import Link from 'next/link';
import ThemeProvider from '@/components/website/ThemeProvider';
import { mergeTheme, type Course, type School } from '@/lib/theme';
import { makeCtx, OPTS, Header, Footer, img, btnCls } from '@/components/website/templates/chrome';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

async function load(sub: string): Promise<{ school: School | null; courses: Course[] }> {
  const r = await fetch(`${API}/schools/subdomain/${encodeURIComponent(sub)}`, { next: { revalidate: 30 } });
  if (!r.ok) return { school: null, courses: [] };
  const j = await r.json();
  const school = (j.school || j.data || j) as School;
  let courses: Course[] = [];
  try {
    const cr = await fetch(`${API}/schools/subdomain/${encodeURIComponent(school.subdomain)}/courses`, { next: { revalidate: 30 } });
    if (cr.ok) {
      const cj = await cr.json();
      const list = Array.isArray(cj) ? cj : cj.courses || cj.data || [];
      courses = list.filter((c: any) => c.is_published !== false && c.status !== 'draft');
    }
  } catch {}
  return { school, courses };
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string; courseId: string }> }) {
  const { subdomain, courseId } = await params;
  const { school, courses } = await load(subdomain);
  const k = courses.find(c => String(c.id) === courseId);
  return { title: k && school ? `${k.title} | ${school.name}` : 'Programme', description: k?.description?.slice(0, 160) };
}

export default async function Programme({ params }: { params: Promise<{ subdomain: string; courseId: string }> }) {
  const { subdomain, courseId } = await params;
  const { school, courses } = await load(subdomain);
  if (!school || !school.id) notFound();
  const course = courses.find(c => String(c.id) === courseId);
  if (!course) notFound();
  const theme = mergeTheme(school.theme_config);
  const base = `/school/${encodeURIComponent(school.subdomain)}`;
  const x = makeCtx({ school, courses, theme, sections: theme.sections }, OPTS[theme.template], base);
  const thumb = img(course.thumbnail_url);
  const ps = x.paras(course.description);
  const info = theme.sections.content.programmes?.[String(course.id)];
  return (
    <ThemeProvider theme={theme}>
      <Header x={x} />
      <main className="px-4 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <Link href={base} className="text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>&larr; Back to {school.name}</Link>
          <h1 className={`mt-4 text-3xl font-bold md:text-5xl ${x.trk}`} style={x.head}>{course.title}</h1>
          {thumb && <img src={thumb} alt="" className="mt-8 h-64 w-full object-cover" style={{ borderRadius: 'var(--radius-card)' }} />}
          {info && (info.duration || info.fees || info.requirements) && (
            <dl className="mt-8 grid gap-4 border-y border-slate-300 py-6 sm:grid-cols-2">
              {info.duration && <div><dt className="text-xs uppercase tracking-widest opacity-60">Duration</dt><dd className="mt-1 text-lg font-semibold">{info.duration}</dd></div>}
              {info.fees && <div><dt className="text-xs uppercase tracking-widest opacity-60">Fees</dt><dd className="mt-1 text-lg font-semibold">{info.fees}</dd></div>}
              {info.requirements && <div className="sm:col-span-2"><dt className="text-xs uppercase tracking-widest opacity-60">Entry requirements</dt><dd className="mt-1 whitespace-pre-line">{info.requirements}</dd></div>}
            </dl>
          )}
          <div className="mt-8 space-y-4 text-lg leading-relaxed">
            {ps.length ? ps.map((t, i) => <p key={i}>{t}</p>) : <p className="opacity-70">Details for this programme are available from the admissions office.</p>}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`${x.apply}?programme=${encodeURIComponent(String(course.id))}`} className={btnCls} style={x.btn(true, false)}>Apply for this programme</Link>
            <Link href={base + '#admissions'} className={btnCls} style={x.btn(false, false)}>Admissions information</Link>
          </div>
        </div>
      </main>
      <Footer x={x} />
    </ThemeProvider>
  );
}
