import Link from 'next/link';

export default function Logo({ href = '/', size = 36, dark = false }: { href?: string; size?: number; dark?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Edunova" width={size} height={size} />
      <span className={`text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Edunova</span>
    </Link>
  );
}
