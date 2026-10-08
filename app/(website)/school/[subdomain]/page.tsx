import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, GraduationCap } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';

export default async function SchoolPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const sRes = await fetch(`${API}/schools/public/${subdomain}`, { next: { revalidate: 3600 } });
  if (!sRes.ok) notFound();
  const school = await sRes.json();
  const cRes = await fetch(`${API}/courses/public/school/${school.id}`, { next: { revalidate: 3600 } });
  const { courses = [] } = cRes.ok ? await cRes.json() : {};

  return (
    <main className="bg-white text-slate-800">
      <section style={{ '--school-color': school.primary_color || '#2563eb', backgroundColor: 'var(--school-color)' } as React.CSSProperties} className="text-white px-4 py-20 text-center">
        {school.logo_url
          ? <img src={school.logo_url} alt={school.name} className="h-20 w-20 rounded-full mx-auto mb-4 object-cover border-4 border-white/30" />
          : <div className="h-20 w-20 rounded-full mx-auto mb-4 bg-white/20 flex items-center justify-center text-3xl font-bold">{school.name?.[0]}</div>}
        <h1 className="text-4xl font-bold mb-2">{school.name}</h1>
        {school.tagline && <p className="text-white/80 text-lg mb-6">{school.tagline}</p>}
        <Link href={`/onboarding?school=${subdomain}`} className="inline-block px-8 py-3 rounded-xl bg-white font-semibold text-slate-900 hover:bg-slate-100">Join this school</Link>
      </section>
      <section className="px-4 py-10 max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
        {([['Students', Users, school.student_count ?? 0], ['Teachers', GraduationCap, school.teacher_count ?? 0], ['Courses', BookOpen, school.course_count ?? courses.length]] as const).map(([label, Icon, value]) => (
          <div key={label} className="bg-slate-50 rounded-2xl p-6">
            <Icon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </section>
      {courses.length > 0 && (
        <section className="px-4 pb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Published Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {courses.map((c: { id: number; title: string; description?: string; thumbnail_url?: string }) => (
              <div key={c.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                {c.thumbnail_url ? <img src={c.thumbnail_url} className="h-36 w-full object-cover" alt={c.title} /> : <div className="h-36 bg-slate-100 flex items-center justify-center"><BookOpen className="h-8 w-8 text-slate-300" /></div>}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 leading-snug">{c.title}</h3>
                  {c.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description}</p>}
                  <Link href={`/onboarding?school=${subdomain}`} className="mt-3 block text-center py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Enroll</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
