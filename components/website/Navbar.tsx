'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, GraduationCap } from 'lucide-react';

const links = [['Features', '/features'], ['Pricing', '/pricing'], ['Schools', '/schools'], ['Blog', '/blog']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn(); window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <header className={`sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <GraduationCap className="h-6 w-6 text-blue-600" /> Edunova
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map(([l, h]) => <Link key={h} href={h} className="text-sm text-slate-600 hover:text-slate-900">{l}</Link>)}
          <Link href="/login" className="text-sm font-medium text-slate-700">Login</Link>
          <Link href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Get Started</Link>
        </div>
        <button aria-label="Menu" className="flex h-11 w-11 items-center justify-center md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {[...links, ['Login', '/login']].map(([l, h]) => (
            <Link key={h} href={h} onClick={() => setOpen(false)} className="block min-h-11 py-3 text-slate-700">{l}</Link>
          ))}
          <Link href="/register" className="block rounded-lg bg-blue-600 py-3 text-center font-semibold text-white">Get Started</Link>
        </div>
      )}
    </header>
  );
}
