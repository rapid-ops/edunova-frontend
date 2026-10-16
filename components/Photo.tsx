'use client';
import { useEffect, useRef, useState } from 'react';

export function StudentsArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 440" className={className} role="img" aria-label="Students">
      <ellipse cx="200" cy="420" rx="170" ry="14" fill="#1f63f5" opacity=".08" />
      <g>
        <rect x="250" y="190" width="90" height="230" rx="40" fill="#f5f7ff" />
        <path d="M262 190h66l12 60h-90z" fill="#fff" />
        <path d="M290 190l10 70-10 10-10-10z" fill="#1f3a93" />
        <circle cx="295" cy="150" r="38" fill="#7a4a31" />
        <path d="M257 148c0-30 16-46 40-46s38 16 38 40c-12-14-30-20-50-18-10 2-22 10-28 24z" fill="#1b1410" />
      </g>
      <g>
        <path d="M70 420c0-110 40-190 120-190s120 80 120 190z" fill="#fff" />
        <path d="M70 420c0-80 20-140 55-170l15 170z" fill="#1f3a93" />
        <path d="M310 420c0-80-20-140-55-170l-15 170z" fill="#1f3a93" />
        <path d="M190 232l12 80-12 14-12-14z" fill="#1f3a93" />
        <rect x="110" y="300" width="110" height="130" rx="8" fill="#0f2a6b" />
        <circle cx="190" cy="165" r="52" fill="#6b3f2a" />
        <path d="M136 168c-4-52 24-82 58-82s62 30 56 86c-6-26-20-44-34-52-22 6-52 12-80 48z" fill="#1b1410" />
        <path d="M150 190c14 20 26 30 40 30s28-10 42-30" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".9" />
      </g>
    </svg>
  );
}

export default function Photo({ src, alt, className = '', fallback }: { src: string; alt: string; className?: string; fallback: React.ReactNode }) {
  const [bad, setBad] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setBad(true);
  }, []);
  if (bad) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} className={className} onError={() => setBad(true)} />;
}
