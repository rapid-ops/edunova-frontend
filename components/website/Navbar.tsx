'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';

const links = [['Features', '/features'], ['Pricing', '/pricing'], ['Courses', '/courses'], ['Blog', '/blog']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn(); window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <div className="hidden items-center gap-7 md:flex">
          {links.map(([l, h]) => <Link key={h} href={h} className="text-sm font-medium text-slate-600 hover:text-slate-900">{l}</Link>)}
          <Link href="/auth/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Log In</Link>
          <Link href="/register" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Get Started</Link>
        </div>
        <button aria-label="Menu" className="flex h-11 w-11 items-center justify-center md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {[...links, ['Log In', '/auth/login']].map(([l, h]) => (
            <Link key={h} href={h} onClick={() => setOpen(false)} className="block min-h-11 py-3 text-slate-700">{l}</Link>
          ))}
          <Link href="/register" onClick={() => setOpen(false)} className="block rounded-lg bg-blue-600 py-3 text-center font-semibold text-white">Get Started</Link>
        </div>
      )}
    </header>
  );
}
