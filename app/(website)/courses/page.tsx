'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';
interface Course { id: number; title: string; description: string; school_name: string; subdomain: string; thumbnail_url?: string; }

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/courses/public`)
      .then(r => r.json())
      .then(d => { setCourses(d.courses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.school_name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="bg-white text-slate-800">
      <section className="bg-slate-900 text-white px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Course Marketplace</h1>
        <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">Browse published courses from schools across Edunova.</p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses or schools..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 text-base" />
        </div>
      </section>
      <section className="px-4 py-16 max-w-6xl mx-auto">
        {loading && <p className="text-center text-slate-400">Loading...</p>}
        {!loading && filtered.length === 0 && <p className="text-center text-slate-400">No courses found.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map(c => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
              {c.thumbnail_url ? <img src={c.thumbnail_url} alt={c.title} className="h-40 w-full object-cover" /> : <div className="h-40 bg-slate-100 flex items-center justify-center"><BookOpen className="h-10 w-10 text-slate-300" /></div>}
              <div className="p-5 flex flex-col flex-1 gap-2">
                <p className="text-xs text-blue-600 font-medium">{c.school_name}</p>
                <h2 className="font-semibold text-slate-900 leading-snug">{c.title}</h2>
                {c.description && <p className="text-slate-500 text-sm line-clamp-2 flex-1">{c.description}</p>}
                <Link href={`/onboarding?school=${c.subdomain}`} className="mt-3 block text-center rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">Enroll</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
