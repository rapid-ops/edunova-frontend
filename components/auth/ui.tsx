import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function Badge({ icon: Icon, tone = 'blue', children }: { icon: LucideIcon; tone?: 'blue' | 'green'; children: ReactNode }) {
  const c = tone === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600';
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${c}`}><Icon className="h-4 w-4" />{children}</span>;
}

export function OrDivider() {
  return <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs uppercase text-slate-500">or</span><div className="h-px flex-1 bg-slate-200" /></div>;
}

export function InfoBox({ icon: Icon = Info, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl bg-blue-50/70 p-4 text-xs leading-relaxed text-slate-600">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Icon className="h-4 w-4" /></span>
      <p>{children}</p>
    </div>
  );
}
