'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import ErrorState from '@/components/admin/ErrorState';
import Skeleton from '@/components/admin/Skeleton';

export const greeting = () => {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};
export const firstName = (n?: string | null) => (n || '').trim().split(/\s+/)[0] || 'there';
const dateFmt = new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', year: 'numeric' });
export const fmtDate = (s?: string | null) => (s ? dateFmt.format(new Date(s)) : '');
export const naira = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
export const hhmm = (s?: string | null) => (s ? s.slice(0, 5) : '');
export const pctTone = (p: number | null | undefined): 'green' | 'orange' | 'red' | 'gray' => (p === null || p === undefined ? 'gray' : p >= 70 ? 'green' : p >= 50 ? 'orange' : 'red');

export function dueLabel(s?: string | null): { text: string; tone: 'red' | 'orange' | 'blue' | 'gray' } {
  if (!s) return { text: '', tone: 'gray' };
  const ms = new Date(s).getTime() - Date.now();
  if (ms < 0) return { text: 'Overdue', tone: 'red' };
  const days = Math.ceil(ms / 86400000);
  if (days <= 1) return { text: 'Due today', tone: 'red' };
  if (days <= 3) return { text: days + ' days left', tone: 'orange' };
  return { text: days + ' days left', tone: 'blue' };
}

export function usePortalData(path: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<{ retry: boolean; msg: string } | null>(null);
  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true); setErr(null);
    try {
      const r = await api.get(path);
      setData(r.data.dashboard);
    } catch (e: any) {
      const s = e?.response?.status;
      if (!e?.response) setErr({ retry: true, msg: 'Could not connect. Check your internet and try again.' });
      else if (s === 403) setErr({ retry: false, msg: 'You do not have access to this page.' });
      else setErr({ retry: true, msg: 'Something went wrong while loading. Please try again.' });
    } finally { setLoading(false); }
  }, [path]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, err, reload: load };
}

export function Card({ title, href, linkLabel = 'View all', children, className = '' }: { title: string; href?: string; linkLabel?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[#0b1a4a]">{title}</h2>
        {href && <Link href={href} className="flex min-h-11 items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">{linkLabel} <ArrowRight className="h-3.5 w-3.5" /></Link>}
      </div>
      {children}
    </section>
  );
}

export function EmptyBlock({ text, href, cta }: { text: string; href?: string; cta?: string }) {
  return (
    <div className="rounded-xl bg-blue-50/60 p-4 text-sm text-slate-600">
      <p>{text}</p>
      {href && cta && <Link href={href} className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-blue-600 hover:underline">{cta} <ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}

export function Bar({ value, color = 'bg-blue-600' }: { value: number | null | undefined; color?: string }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color}`} style={{ width: v + '%' }} /></div>;
}

export function PageError({ err, onRetry }: { err: { retry: boolean; msg: string }; onRetry: () => void }) {
  return <div className="p-4"><ErrorState message={err.msg} onRetry={err.retry ? onRetry : undefined} /></div>;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-4 lg:p-6" aria-busy="true">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
