import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';

async function getSchool(subdomain: string) {
  try {
    const r = await fetch(`${API}/schools/public/${subdomain}`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    const d = await r.json();
    return d.school || null;
  } catch { return null; }
}

async function getCourses(schoolId: number) {
  try {
    const r = await fetch(`${API}/courses/public?school_id=${schoolId}`, { next: { revalidate: 60 } });
    if (!r.ok) return [];
    const d = await r.json();
    return d.courses || [];
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const school = await getSchool(subdomain);
  if (!school) return {};
  return { title: `${school.name} | Edunova`, description: school.tagline || `${school.name} on Edunova` };
}

export default async function SchoolPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const school = await getSchool(subdomain);
  if (!school) notFound();
  const courses = await getCourses(school.id);

  return (
    <main className="bg-white text-slate-800" style={{ '--primary': school.primary_color || '#2563eb' } as React.CSSProperties}>
      <section className="px-4 py-20 text-center" style={{ background: school.primary_color || '#2563eb' }}>
        {school.logo_url && <img src={school.logo_url} alt={school.name} className="h-20 w-20 rounded-full object-cover mx-auto mb-4 border-4 border-white/30" />}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{school.name}</h1>
        {school.tagline && <p className="text-white/80 text-lg max-w-xl mx-auto">{school.tagline}</p>}
        <Link href={`/onboarding?school=${subdomain}`} className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-white px-8 font-semibold" style={{ color: school.primary_color || '#2563eb' }}>Join this school</Link>
      </section>

      <section className="bg-slate-50 px-4 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div><p className="text-3xl font-bold text-slate-900">{(school.student_count || 0).toLocaleString()}</p><p className="text-slate-500 text-sm mt-1 flex items-center justify-center gap-1"><Users className="h-4 w-4" />Students</p></div>
          <div><p className="text-3xl font-bold text-slate-900">{(school.teacher_count || 0).toLocaleString()}</p><p className="text-slate-500 text-sm mt-1 flex items-center justify-center gap-1"><GraduationCap className="h-4 w-4" />Teachers</p></div>
          <div><p className="text-3xl font-bold text-slate-900">{(school.course_count || 0).toLocaleString()}</p><p className="text-slate-500 text-sm mt-1 flex items-center justify-center gap-1"><BookOpen className="h-4 w-4" />Courses</p></div>
        </div>
      </section>

      {courses.length > 0 && (
        <section className="px-4 py-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Published Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {courses.map((c: { id: number; title: string; description: string }) => (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="h-32 rounded-lg bg-slate-100 mb-4 flex items-center justify-center"><BookOpen className="h-8 w-8 text-slate-300" /></div>
                <h3 className="font-semibold text-slate-900 leading-snug">{c.title}</h3>
                {c.description && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{c.description}</p>}
                <Link href={`/onboarding?school=${subdomain}`} className="mt-4 block text-center rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Enroll</Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
