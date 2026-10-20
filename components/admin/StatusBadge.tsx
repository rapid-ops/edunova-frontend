export type Tone = 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'gray';

export const toneClasses: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
  orange: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-violet-50 text-violet-700',
  gray: 'bg-slate-100 text-slate-600',
};

export default function StatusBadge({ tone = 'gray', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>{children}</span>;
}
