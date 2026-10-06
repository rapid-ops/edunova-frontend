'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';
interface School { name: string; subdomain: string; student_count: number; }

export default function SchoolShowcase() {
  const [schools, setSchools] = useState<School[]>([]);
  useEffect(() => {
    fetch(`${API}/schools/public`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (Array.isArray(d?.schools) && d.schools.length > 0) setSchools(d.schools); })
      .catch(() => {});
  }, []);
  if (schools.length === 0) return null;
  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex gap-4 w-max">
        {schools.map((s) => (
          <a key={s.subdomain} href={`/school/${s.subdomain}`} className="bg-white border border-slate-100 rounded-2xl p-5 min-w-[200px] shadow-sm flex flex-col gap-1 hover:border-blue-200 transition-colors">
            <p className="font-semibold text-slate-800 text-sm leading-snug">{s.name}</p>
            <p className="text-blue-500 text-xs font-medium">@{s.subdomain}</p>
            <p className="text-slate-400 text-xs mt-1">{(s.student_count || 0).toLocaleString()} students</p>
          </a>
        ))}
      </div>
    </div>
  );
}
