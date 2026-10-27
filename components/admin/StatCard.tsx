import type { LucideIcon } from 'lucide-react';
import Skeleton from './Skeleton';

const tones = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-emerald-100 text-emerald-600',
  purple: 'bg-violet-100 text-violet-600',
  orange: 'bg-orange-100 text-orange-500',
  red: 'bg-red-100 text-red-500',
};

// Nothing is cut off: text wraps, long values get a smaller size, and `full` is shown on hover or long press.
export default function StatCard({ label, value, icon: Icon, tone = 'blue', hint, loading, full }: { label: string; value: string | number; icon: LucideIcon; tone?: keyof typeof tones; hint?: string; loading?: boolean; full?: string }) {
  const text = String(value);
  const size = text.length > 8 ? 'text-lg' : 'text-xl sm:text-2xl';
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${tones[tone]}`}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></span>
      <div className="min-w-0 flex-1">
        {loading ? <Skeleton className="h-7 w-16" /> : <p title={full || text} className={`break-words font-extrabold leading-tight text-[#0b1a4a] ${size}`}>{value}</p>}
        <p className="break-words text-xs leading-snug text-slate-500">{label}</p>
        {hint && !loading && <p className="mt-0.5 break-words text-xs leading-snug text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
