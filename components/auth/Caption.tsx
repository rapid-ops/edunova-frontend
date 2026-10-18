import { hand } from '@/lib/hand';

export default function Caption({ lines, className = '' }: { lines: string[]; className?: string }) {
  return (
    <p className={`${hand.className} -rotate-6 text-xl leading-6 text-[#0b1a4a] sm:text-2xl ${className}`}>
      {lines.map((l, i) => <span key={i} className="block">{l}</span>)}
      <svg viewBox="0 0 120 10" className="mt-1 w-24" aria-hidden="true"><path d="M2 7c30-6 70-6 116-2" stroke="#1f63f5" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
    </p>
  );
}
