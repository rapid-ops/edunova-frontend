import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

const links = [['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms']];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <GraduationCap className="h-5 w-5 text-blue-600" /> Edunova
        </Link>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map(([l, h]) => <Link key={h} href={h} className="text-sm text-slate-600 hover:text-slate-900">{l}</Link>)}
        </div>
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Edunova. Built in Nigeria.</p>
      </div>
    </footer>
  );
}
