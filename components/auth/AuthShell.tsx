import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Logo from '@/components/Logo';
import Photo from '@/components/Photo';
import Art from '@/components/auth/Art';
import Caption from '@/components/auth/Caption';
import AuthFooter from '@/components/auth/AuthFooter';

export type Tile = { icon: LucideIcon; title: string; text: string };

export default function AuthShell({ backHref, backLabel, caption, badge = 'none', photo, tiles, below, children }: {
  backHref: string; backLabel: string; caption: string[]; badge?: 'lock' | 'check' | 'none'; photo: string; tiles?: Tile[]; below?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f4f9ff] to-[#e9f2ff] text-slate-900">
      <header className="bg-white/80">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Logo size={42} />
          <Link href={backHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#0b1a4a] hover:text-blue-600"><ArrowLeft className="h-4 w-4" />{backLabel}</Link>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-12">
        <section className="w-full max-w-xl justify-self-center rounded-2xl bg-white p-6 shadow-sm sm:p-8 lg:justify-self-end">{children}</section>
        <aside className="w-full">
          <div className="relative mx-auto max-w-sm">
            <Caption lines={caption} className="absolute right-0 top-0 z-[1]" />
            <Photo src={photo} alt="Smiling student holding a book" className="mx-auto w-full max-w-xs object-contain" fallback={<Art badge={badge} className="max-w-xs" />} />
          </div>
          {tiles && (
            <ul className="mx-auto mt-6 hidden max-w-md space-y-5 rounded-2xl bg-white/80 p-6 shadow-sm lg:block">
              {tiles.map(({ icon: I, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><I className="h-5 w-5" /></span>
                  <span><span className="block text-sm font-semibold text-[#0b1a4a]">{title}</span><span className="block text-xs text-slate-500">{text}</span></span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
      {below && <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-8">{below}</div>}
      <AuthFooter />
    </div>
  );
}
