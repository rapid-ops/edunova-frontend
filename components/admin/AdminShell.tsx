'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, Menu, X, ChevronDown, LogOut, User as UserIcon, MoreHorizontal, Bot, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import NotificationBell from '@/components/NotificationBell';
import MessageBell, { UnreadPill } from '@/components/MessageBell';
import Avatar from '@/components/admin/Avatar';
import { enabledNav, isActive, moreNav, moreGroups, type AdminNavItem } from '@/lib/admin-nav';
import { useAuthStore } from '@/store/auth.store';

const ROLE: Record<string, string> = { school_admin: 'School Administrator', super_admin: 'Super Administrator' };
const focus = 'outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
const SHORT: Record<string, string> = { communication: 'Messages', assessments: 'Tests', examinations: 'Exams', announcements: 'Notices', alerts: 'Alerts', teaching: 'Teaching', departments: 'Depts', reportcards: 'Report cards', coupons: 'Discounts', automations: 'Automatic', dropout: 'At risk', reset: 'Reset' };

function NavLink({ i, pathname, onNavigate }: { i: AdminNavItem; pathname: string; onNavigate?: () => void }) {
  const Icon = i.icon;
  const on = isActive(pathname, i.href);
  return (
    <Link href={i.href} onClick={onNavigate} aria-current={on ? 'page' : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-medium ${focus} ${on ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-blue-50'}`}>
      <Icon className="h-[18px] w-[18px] shrink-0" />{i.label}{i.key === 'communication' && <UnreadPill />}
    </Link>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <nav aria-label="Main" className="space-y-1">
        {enabledNav().map((i) => <NavLink key={i.key} i={i} pathname={pathname} onNavigate={onNavigate} />)}
      </nav>
      <nav aria-label="More" className="mt-4 space-y-4 border-t border-slate-100 pt-4">
        {moreGroups.map((g) => {
          const items = moreNav.filter((i) => i.group === g && i.enabled);
          if (!items.length) return null;
          return (
            <div key={g}>
              <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{g}</p>
              <div className="space-y-1">{items.map((i) => <NavLink key={i.key} i={i} pathname={pathname} onNavigate={onNavigate} />)}</div>
            </div>
          );
        })}
      </nav>
    </>
  );
}

function AiCard({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="rounded-2xl bg-blue-50 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600"><Bot className="h-5 w-5" /></span>
        <div><p className="text-sm font-bold text-[#0b1a4a]">Edunova AI</p><p className="text-xs text-slate-500">Your AI assistant for school management</p></div>
      </div>
      <Link href="/school-admin/ai" onClick={onNavigate} className={`mt-3 flex min-h-11 items-center justify-center gap-2 rounded-full border border-blue-300 bg-white text-sm font-semibold text-blue-600 hover:bg-blue-50 ${focus}`}>
        Ask Anything <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDrawer(false); setMenu(false); }, [pathname]);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const term = q.trim().toLowerCase();
  const results = term ? [...enabledNav(), ...moreNav].filter((i) => i.label.toLowerCase().includes(term)) : [];
  const go = (href: string) => { setQ(''); router.push(href); };

  const nav: AdminNavItem[] = [...enabledNav(), ...moreNav];
  const active = nav.find((i) => isActive(pathname, i.href));
  const keys = ['dashboard', 'students', 'courses', 'reports'];
  if (active && !keys.includes(active.key)) keys[3] = active.key;
  const bottom = keys.map((k) => nav.find((i) => i.key === k)).filter(Boolean) as AdminNavItem[];

  const signOut = () => { logout(); router.push('/auth/login'); };
  const name = user?.full_name || 'Account';

  return (
    <div className="min-h-screen bg-[#f4f8ff] lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-100 bg-white lg:flex">
        <div className="flex h-[68px] items-center px-5"><Logo size={34} /></div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 pb-6"><NavList pathname={pathname} /><div className="mt-4 space-y-4"><AiCard /><div className="px-2 pb-1"><Logo size={26} /></div></div></div>
        
      </aside>

      <header className="sticky top-0 z-30 flex h-[68px] items-center gap-2 border-b border-slate-100 bg-white/90 px-3 backdrop-blur lg:px-6">
        <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className={`flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-blue-50 lg:hidden ${focus}`}><Menu className="h-5 w-5" /></button>
        <div className="lg:hidden"><Logo size={30} tagline={false} /></div>

        <form onSubmit={(e) => { e.preventDefault(); if (results[0]) go(results[0].href); }} className="relative hidden max-w-lg flex-1 md:block">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setQ('')} aria-label="Search pages" placeholder="Search pages..."
            className={`h-11 w-full rounded-xl border border-blue-100 bg-blue-50/40 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 ${focus}`} />
          {term && (
            <ul className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
              {results.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">No matching page</li>}
              {results.map((i) => (
                <li key={i.key}><button type="button" onClick={() => go(i.href)} className="flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm text-slate-700 hover:bg-blue-50"><i.icon className="h-4 w-4 text-blue-600" />{i.label}</button></li>
              ))}
            </ul>
          )}
        </form>

        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />
          <MessageBell href="/dashboard/messages" />
          <div ref={menuRef} className="relative">
            <button type="button" onClick={() => setMenu(!menu)} aria-label="Account menu" aria-expanded={menu} className={`flex min-h-11 items-center gap-2 rounded-full pl-1 pr-2 hover:bg-blue-50 ${focus}`}>
              <Avatar name={name} src={user?.avatar_url} size={36} />
              <span className="hidden text-left sm:block"><span className="block max-w-[140px] truncate text-sm font-semibold text-[#0b1a4a]">{name}</span><span className="block text-xs text-slate-500">{ROLE[user?.role || ''] || 'Administrator'}</span></span>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>
            {menu && (
              <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3 sm:hidden"><p className="truncate text-sm font-semibold text-[#0b1a4a]">{name}</p><p className="text-xs text-slate-500">{ROLE[user?.role || ''] || 'Administrator'}</p></div>
                <Link href="/profile" className="flex min-h-11 items-center gap-3 px-4 text-sm text-slate-700 hover:bg-blue-50"><UserIcon className="h-4 w-4" />Profile</Link>
                <button type="button" onClick={signOut} className="flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-68px)] pb-20 lg:pb-0">{children}</main>

      <nav aria-label="Bottom" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {bottom.map((i) => {
          const Icon = i.icon;
          const on = isActive(pathname, i.href);
          return (
            <Link key={i.key} href={i.href} aria-current={on ? 'page' : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${focus} ${on ? 'text-blue-600' : 'text-slate-500'}`}>
              <Icon className="h-5 w-5" /><span className="max-w-full px-0.5 text-center leading-tight">{SHORT[i.key] || i.short || i.label}</span>
            </Link>
          );
        })}
        <button type="button" onClick={() => setDrawer(true)} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-slate-500 ${focus}`}><MoreHorizontal className="h-5 w-5" />More</button>
      </nav>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-slate-900/40" />
          <div className="absolute left-0 top-0 flex h-[100dvh] w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex h-[68px] items-center justify-between px-4"><Logo size={32} /><button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className={`flex h-11 w-11 items-center justify-center rounded-lg hover:bg-blue-50 ${focus}`}><X className="h-5 w-5" /></button></div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 pb-8"><NavList pathname={pathname} onNavigate={() => setDrawer(false)} /><div className="mt-4"><AiCard onNavigate={() => setDrawer(false)} /></div></div>
            
          </div>
        </div>
      )}
    </div>
  );
}
