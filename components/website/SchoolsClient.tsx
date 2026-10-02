'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, School } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';
interface S { id: number; name: string; subdomain: string; logo_url?: string | null; primary_color?: string }

export default function SchoolsClient() {
  const [all, setAll] = useState<S[]>([]);
  const [q, setQ] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    fetch(`${API}/schools/public`).then(r => r.json()).then(j => setAll(j.schools || [])).catch(() => {}).finally(() => setDone(true));
  }, []);
  const list = all.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="relative mx-auto mb-8 max-w-md">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search schools" className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 text-base" />
      </div>
      {done && list.length === 0 && <p className="text-center text-slate-500">No schools found.</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(s => (
          <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {s.logo_url && /^https:\/\//.test(s.logo_url)
              ? <img src={s.logo_url} alt={`${s.name} logo`} className="mb-3 h-12 w-12 rounded-xl object-cover" />
              : <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: s.primary_color || '#2563eb' }}><School className="h-6 w-6" /></div>}
            <div className="font-semibold text-slate-900">{s.name}</div>
            <div className="text-sm text-slate-500">{s.subdomain}</div>
            <Link href={`/school/${s.subdomain}`} className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-blue-600 font-semibold text-white">Visit School</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
