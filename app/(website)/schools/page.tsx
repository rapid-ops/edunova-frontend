'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';
interface School { id: number; name: string; subdomain: string; logo_url: string | null; primary_color: string; tagline: string | null; student_count: number; }

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/schools/public`)
      .then((r) => r.json())
      .then((d) => { setSchools(d.schools || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = schools.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="bg-white text-slate-800">
      <section className="bg-slate-900 text-white px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Schools on Edunova</h1>
        <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">Browse schools using Edunova across Nigeria and Africa.</p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search schools..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 text-base" />
        </div>
      </section>

      <section className="px-4 py-16 max-w-6xl mx-auto">
        {loading && <p className="text-center text-slate-400">Loading...</p>}
        {!loading && filtered.length === 0 && <p className="text-center text-slate-400">No schools found.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="h-12 w-12 rounded-full object-cover border border-slate-100" />
                ) : (
                  <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: s.primary_color || '#2563eb' }}>{s.name[0]}</div>
                )}
                <div>
                  <p className="font-semibold text-slate-900 leading-tight">{s.name}</p>
                  <p className="text-blue-500 text-xs">@{s.subdomain}</p>
                </div>
              </div>
              {s.tagline && <p className="text-slate-500 text-sm leading-snug">{s.tagline}</p>}
              <p className="text-slate-400 text-xs">{(s.student_count || 0).toLocaleString()} students</p>
              <Link href={`/school/${s.subdomain}`} className="mt-auto flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">Visit School <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-600 px-4 py-14 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Run a school? Join Edunova.</h2>
        <Link href="/register" className="inline-flex min-h-11 items-center rounded-lg bg-white px-8 font-semibold text-blue-700">Register your school</Link>
      </section>
    </main>
  );
}
