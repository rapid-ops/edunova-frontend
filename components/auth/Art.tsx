import { Check, Lock } from 'lucide-react';

export default function Art({ badge = 'none', className = '' }: { badge?: 'lock' | 'check' | 'none'; className?: string }) {
  return (
    <div className={`relative mx-auto aspect-[4/5] w-full ${className}`} role="img" aria-label="Student illustration">
      <div className="absolute inset-x-[4%] bottom-0 top-[10%] rounded-[45%_55%_42%_58%/48%_44%_56%_52%] bg-gradient-to-br from-blue-100 to-blue-200/70" />
      <svg viewBox="0 0 200 250" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="100" cy="82" r="30" fill="#6b4331" />
        <path d="M44 250c0-52 24-84 56-84s56 32 56 84z" fill="#fff" stroke="#c9d8f6" />
        <path d="M92 166l8 28 8-28z" fill="#0b1a4a" />
        <rect x="68" y="188" width="64" height="48" rx="4" fill="#12285f" />
      </svg>
      {badge !== 'none' && (
        <span className="absolute bottom-[12%] right-[2%] h-24 w-20">
          <svg viewBox="0 0 64 76" className="h-full w-full" aria-hidden="true">
            <path d="M32 2 6 12v22c0 17 11 31 26 38 15-7 26-21 26-38V12z" fill={badge === 'lock' ? '#1f63f5' : '#19c28a'} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-white">
            {badge === 'lock' ? <Lock className="h-8 w-8" /> : <Check className="h-10 w-10" strokeWidth={3.5} />}
          </span>
        </span>
      )}
    </div>
  );
}
