'use client';
import CountUp from 'react-countup';

export interface StatItem { label: string; value: number; prefix?: string; suffix?: string }

export default function StatsCounter({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
      {items.map(s => (
        <div key={s.label}>
          <div className="text-3xl font-bold md:text-4xl">
            <CountUp end={s.value} duration={2} enableScrollSpy scrollSpyOnce prefix={s.prefix} suffix={s.suffix} separator="," />
          </div>
          <div className="mt-1 text-sm opacity-80">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
