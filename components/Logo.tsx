import Link from 'next/link';

export function CapIcon({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 40" width={size} height={size * 40 / 48} aria-hidden="true">
      <path d="M24 2L2 13l22 11 22-11L24 2z" fill="#1f63f5" />
      <path d="M10 20v10c0 3 6.5 7 14 7s14-4 14-7V20l-14 7-14-7z" fill="#0f46c9" />
      <path d="M44 14v12" stroke="#1f63f5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ href = '/', size = 40, dark = false, tagline = true }: { href?: string; size?: number; dark?: boolean; tagline?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5" aria-label="Edunova home">
      <CapIcon size={size} />
      <span className="flex flex-col leading-none">
        <span className={`text-2xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-[#0b1a4a]'}`}>Edunova</span>
        {tagline && <span className={`mt-1 text-[10px] tracking-wide ${dark ? 'text-blue-100' : 'text-slate-500'}`}>Learn &middot; Grow &middot; Excel</span>}
      </span>
    </Link>
  );
}
