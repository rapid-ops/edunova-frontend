import { notFound } from 'next/navigation';
import Link from 'next/link';
import ThemeProvider from '@/components/website/ThemeProvider';
import ApplyForm from '@/components/website/ApplyForm';
import { mergeTheme, type Course, type School } from '@/lib/theme';
import { makeCtx, OPTS, Header, Footer } from '@/components/website/templates/chrome';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

async function load(sub: string): Promise<{ school: School | null; courses: Course[] }> {
  const r = await fetch(`${API}/schools/subdomain/${encodeURIComponent(sub)}`, { next: { revalidate: 30 } });
  if (!r.ok) return { school: null, courses: [] };
  const j = await r.json();
  const school = (j.school || j.data || j) as School;
  let courses: Course[] = [];
  try {
    const cr = await fetch(`${API}/courses/school/${school.id}`, { next: { revalidate: 30 } });
    if (cr.ok) {
      const cj = await cr.json();
      const list = Array.isArray(cj) ? cj : cj.courses || cj.data || [];
      courses = list.filter((c: any) => c.is_published !== false && c.status !== 'draft');
    }
  } catch {}
  return { school, courses };
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const { school } = await load(subdomain);
  return { title: school ? `Apply | ${school.name}` : 'Apply' };
}

export default async function Apply({ params, searchParams }: { params: Promise<{ subdomain: string }>; searchParams: Promise<{ programme?: string }> }) {
  const { subdomain } = await params;
  const { programme } = await searchParams;
  const { school, courses } = await load(subdomain);
  if (!school || !school.id) notFound();
  const theme = mergeTheme(school.theme_config);
  const base = `/school/${encodeURIComponent(school.subdomain)}`;
  const x = makeCtx({ school, courses, theme, sections: theme.sections }, OPTS[theme.template], base);
  const pre = courses.find(c => String(c.id) === programme)?.title || '';
  return (
    <ThemeProvider theme={theme}>
      <Header x={x} />
      <main className="px-4 py-14 md:py-20">
        <div className="mx-auto max-w-xl">
          <Link href={base} className="text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>&larr; Back to {school.name}</Link>
          <h1 className={`mt-4 text-3xl font-bold md:text-4xl ${x.trk}`} style={x.head}>Apply to {school.name}</h1>
          <p className="mt-3 opacity-75">Send your details and the admissions office will contact you.</p>
          <div className="mt-8"><ApplyForm subdomain={school.subdomain} programmes={courses.map(c => c.title)} preselect={pre} /></div>
          <p className="mt-8 text-sm opacity-70">Already a student? <Link href={x.portal} className="font-semibold underline">Portal login</Link></p>
        </div>
      </main>
      <Footer x={x} />
    </ThemeProvider>
  );
}
