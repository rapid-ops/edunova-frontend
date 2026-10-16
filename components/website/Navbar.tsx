'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';

const links = [['Home', '/'], ['Features', '/features'], ['For Schools', '/#schools'], ['For Teachers', '/#teachers'], ['For Students', '/#students'], ['Pricing', '/pricing'], ['Contact', '/contact']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn(); window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4">
        <Logo />
        <div className="hidden items-center gap-7 lg:flex">
          {links.map(([l, h]) => {
            const active = h === '/' ? path === '/' : path === h;
            return (
              <Link key={h} href={h} className={`border-b-2 py-1 text-[13px] font-medium ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-blue-600'}`}>{l}</Link>
            );
          })}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/auth/login" className="rounded-lg border border-blue-600 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">Log In</Link>
          <Link href="/register" className="rounded-lg bg-[#1f63f5] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Get Started</Link>
        </div>
        <button aria-label="Menu" className="flex h-11 w-11 items-center justify-center lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          {links.map(([l, h]) => (
            <Link key={h} href={h} onClick={() => setOpen(false)} className="block min-h-11 py-3 text-slate-700">{l}</Link>
          ))}
          <Link href="/auth/login" onClick={() => setOpen(false)} className="mt-2 block rounded-lg border border-blue-600 py-3 text-center font-semibold text-blue-600">Log In</Link>
          <Link href="/register" onClick={() => setOpen(false)} className="block rounded-lg bg-[#1f63f5] py-3 text-center font-semibold text-white">Get Started</Link>
        </div>
      )}
    </header>
  );
}
