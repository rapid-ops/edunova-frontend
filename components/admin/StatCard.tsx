import type { LucideIcon } from 'lucide-react';
import Skeleton from './Skeleton';

const tones = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-emerald-100 text-emerald-600',
  purple: 'bg-violet-100 text-violet-600',
  orange: 'bg-orange-100 text-orange-500',
  red: 'bg-red-100 text-red-500',
};

export default function StatCard({ label, value, icon: Icon, tone = 'blue', hint, loading }: { label: string; value: string | number; icon: LucideIcon; tone?: keyof typeof tones; hint?: string; loading?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-6 w-6" /></span>
      <div className="min-w-0 flex-1">
        {loading ? <Skeleton className="h-7 w-16" /> : <p className="truncate text-2xl font-extrabold text-[#0b1a4a]">{value}</p>}
        <p className="truncate text-xs text-slate-500">{label}</p>
        {hint && !loading && <p className="mt-0.5 truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
