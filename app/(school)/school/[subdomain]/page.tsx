import { notFound, redirect } from 'next/navigation';
import ThemeProvider from '@/components/website/ThemeProvider';
import { templates } from '@/components/website/templates';
import { mergeTheme, type Course, type School } from '@/lib/theme';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

async function getSchool(sub: string): Promise<School | null> {
  const r = await fetch(`${API}/schools/subdomain/${encodeURIComponent(sub)}`, { next: { revalidate: 30 } });
  if (!r.ok) return null;
  const j = await r.json();
  return (j.school || j.data || j) as School;
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const s = await getSchool(subdomain);
  const c: any = (s as any)?.theme_config?.sections?.content || {};
  const pic = [c.hero_image, s?.logo_url].find((v: any) => typeof v === 'string' && v.startsWith('https://'));
  const desc = s?.tagline || (s ? s.name + ' official website' : '');
  return { title: s ? s.name : 'School', description: desc, openGraph: { title: s ? s.name : 'School', description: desc, type: 'website', images: pic ? [pic] : undefined } };
}

export default async function SchoolPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const school = await getSchool(subdomain);
  if (!school || !school.id) notFound();
  const ext = (school as any).external_website_url;
  if (typeof ext === 'string' && ext.startsWith('https://')) redirect(ext);
  let courses: Course[] = [];
  try {
    const r = await fetch(`${API}/schools/subdomain/${encodeURIComponent(school.subdomain)}/courses`, { next: { revalidate: 30 } });
    if (r.ok) {
      const j = await r.json();
      const list = Array.isArray(j) ? j : j.courses || j.data || [];
      courses = list.filter((c: any) => c.is_published !== false && c.status !== 'draft');
    }
  } catch {}
  const theme = mergeTheme(school.theme_config);
  const Template = templates[theme.template];
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://edunova-frontend-gkaj.vercel.app';
  const ld = {
    '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: school.name,
    url: site + '/school/' + school.subdomain,
    ...(school.tagline ? { description: school.tagline } : {}),
    ...(school.logo_url && school.logo_url.startsWith('https://') ? { logo: school.logo_url } : {}),
    ...(school.email ? { email: school.email } : {}),
    ...(school.phone ? { telephone: school.phone } : {}),
    ...(school.address ? { address: school.address } : {}),
  };
  return (
    <ThemeProvider theme={theme}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <Template school={school} courses={courses} theme={theme} sections={theme.sections} />
    </ThemeProvider>
  );
}
