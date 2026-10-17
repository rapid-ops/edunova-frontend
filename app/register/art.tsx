import { hand } from '@/lib/hand';

export function Caption({ lines, className = '' }: { lines: string[]; className?: string }) {
  return (
    <p className={`${hand.className} -rotate-6 text-2xl leading-6 text-[#0b1a4a] ${className}`}>
      {lines.map((l) => <span key={l} className="block">{l}</span>)}
      <svg viewBox="0 0 120 10" className="mt-1 w-24" aria-hidden="true"><path d="M2 7c30-6 70-6 116-2" stroke="#1f63f5" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
    </p>
  );
}

export function LaptopArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 290" className={className} role="img" aria-label="Laptop showing a graduation cap">
      <defs><linearGradient id="regscr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eef5ff" /><stop offset="1" stopColor="#dbeafe" /></linearGradient></defs>
      <ellipse cx="190" cy="120" rx="150" ry="105" fill="#dbeafe" opacity=".7" />
      <ellipse cx="110" cy="90" rx="62" ry="48" fill="#e6f0ff" />
      <ellipse cx="180" cy="272" rx="150" ry="10" fill="#1f63f5" opacity=".08" />
      <path d="M312 262c-2-40 6-70 22-92 4 34 0 66-22 92z" fill="#3b82f6" opacity=".85" />
      <path d="M300 262c-14-30-14-58-2-86 14 26 14 56 2 86z" fill="#22c55e" />
      <path d="M322 262c12-24 28-40 44-46-6 22-20 38-44 46z" fill="#16a34a" />
      <rect x="88" y="62" width="196" height="132" rx="10" fill="#0f2a6b" />
      <rect x="96" y="70" width="180" height="116" rx="5" fill="url(#regscr)" />
      <g transform="translate(186 128)">
        <path d="M0-26L-38-8 0 10l38-18z" fill="#1f63f5" />
        <path d="M-24 2v20c0 6 11 12 24 12s24-6 24-12V2L0 14z" fill="#0f46c9" />
        <path d="M38-8v26" stroke="#1f63f5" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M60 194h252l-14 22H74z" fill="#cbd5e1" />
      <path d="M60 194h252l-6 8H66z" fill="#94a3b8" />
      <rect x="160" y="200" width="52" height="5" rx="2.5" fill="#94a3b8" />
      <rect x="26" y="236" width="86" height="16" rx="3" fill="#1f63f5" />
      <rect x="32" y="220" width="78" height="16" rx="3" fill="#f59e0b" />
      <rect x="22" y="252" width="94" height="16" rx="3" fill="#10b981" />
      <rect x="52" y="146" width="7" height="56" rx="2" fill="#f97316" transform="rotate(-10 55 174)" />
      <rect x="64" y="140" width="7" height="62" rx="2" fill="#facc15" />
      <rect x="76" y="146" width="7" height="56" rx="2" fill="#ef4444" transform="rotate(10 79 174)" />
      <rect x="46" y="188" width="44" height="32" rx="6" fill="#1f63f5" />
      <rect x="46" y="196" width="44" height="5" fill="#fff" opacity=".35" />
    </svg>
  );
}

export function SocialIcon({ name }: { name: 'facebook' | 'x' | 'instagram' | 'youtube' }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'facebook' && <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6v4h3v8h4v-8h3l.5-4H13V6.5c0-.3.2-.5.5-.5H15z" />}
      {name === 'x' && <><path d="M4 4l16 16" /><path d="M20 4L4 20" /></>}
      {name === 'instagram' && <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" /></>}
      {name === 'youtube' && <><rect x="2" y="6" width="20" height="12" rx="4" /><path d="M10 9.5l5 2.5-5 2.5z" /></>}
    </svg>
  );
}
