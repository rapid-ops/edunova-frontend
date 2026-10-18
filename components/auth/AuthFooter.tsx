import Link from 'next/link';
import type { ReactNode } from 'react';
import Logo from '@/components/Logo';

const links = [['Home', '/'], ['About', '/about'], ['Features', '/features'], ['Contact', '/contact']] as const;

function Social({ label, children }: { label: string; children: ReactNode }) {
  return <a href="#" aria-label={label} className="flex h-11 w-11 items-center justify-center text-[#0b1a4a] hover:text-blue-600"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">{children}</svg></a>;
}

export default function AuthFooter() {
  return (
    <footer className="bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-8 lg:flex-row">
        <Logo size={30} />
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 text-sm text-[#0b1a4a]">
          {links.map(([t, h]) => <Link key={t} href={h} className="inline-flex min-h-11 items-center hover:text-blue-600">{t}</Link>)}
        </nav>
        <div className="flex flex-col items-center gap-1 lg:items-end">
          <div className="flex items-center">
            <Social label="Facebook"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3z" /></Social>
            <Social label="X"><path d="M17.8 3h3l-6.6 7.5L22 21h-6.1l-4.8-6.2L5.6 21h-3l7-8L2 3h6.2l4.3 5.7L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" /></Social>
            <Social label="Instagram"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.2" /></Social>
            <Social label="YouTube"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" /></Social>
          </div>
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Edunova. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
