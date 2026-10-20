const initials = (n?: string) =>
  (n || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?';

export default function Avatar({ name, src, size = 36, className = '' }: { name?: string; src?: string | null; size?: number; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name || 'Avatar'} width={size} height={size} style={{ width: size, height: size }} className={`shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <span aria-label={name || 'Avatar'} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 ${className}`}>
      {initials(name)}
    </span>
  );
}
