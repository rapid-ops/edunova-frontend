'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { School } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';
interface S { id: number; name: string; subdomain: string; logo_url?: string | null; primary_color?: string }

export default function SchoolShowcase() {
  const [schools, setSchools] = useState<S[]>([]);
  useEffect(() => {
    fetch(`${API}/schools/public`).then(r => r.json()).then(j => setSchools(j.schools || [])).catch(() => {});
  }, []);
  if (!schools.length) return <p className="text-center text-slate-500">Schools will appear here.</p>;
  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
      {schools.map(s => (
        <Link key={s.id} href={`/school/${s.subdomain}`} className="w-60 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          {s.logo_url && /^https:\/\//.test(s.logo_url)
            ? <img src={s.logo_url} alt={`${s.name} logo`} className="mb-3 h-12 w-12 rounded-xl object-cover" />
            : <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: s.primary_color || '#2563eb' }}><School className="h-6 w-6" /></div>}
          <div className="font-semibold text-slate-900">{s.name}</div>
          <div className="text-sm text-slate-500">{s.subdomain}</div>
          <div className="mt-3 text-sm font-semibold text-blue-600">Visit school</div>
        </Link>
      ))}
    </div>
  );
}
