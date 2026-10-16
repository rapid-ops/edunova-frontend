import Link from 'next/link';
import Logo from '@/components/Logo';

const cols: [string, [string, string][]][] = [
  ['Product', [['Features', '/features'], ['Pricing', '/pricing'], ['Courses', '/courses'], ['Get Started', '/register']]],
  ['Company', [['About', '/about'], ['Blog', '/blog'], ['Contact', '/contact']]],
  ['Legal', [['Privacy', '/privacy'], ['Terms', '/terms']]],
];

const socials: [string, string, string][] = [
  ['X', 'https://x.com', 'M18.244 2H21l-6.52 7.45L22 22h-6.17l-4.83-6.32L5.5 22H2.74l6.97-7.97L2 2h6.33l4.37 5.78L18.244 2zm-1.08 18h1.53L7.02 3.9H5.38L17.164 20z'],
  ['Facebook', 'https://facebook.com', 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z'],
  ['Instagram', 'https://instagram.com', 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.5 6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z'],
  ['LinkedIn', 'https://linkedin.com', 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11.5H3V9.75zm6.5 0h3.83v1.57h.05c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.79 2.66 4.79 6.12v5.88h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4V9.75z'],
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-600">The LMS built for African schools. Classes, results, fees and parent updates in one place.</p>
          <div className="mt-4 flex gap-3">
            {socials.map(([n, h, d]) => (
              <a key={n} href={h} target="_blank" rel="noopener noreferrer" aria-label={n} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-blue-600">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={d} /></svg>
              </a>
            ))}
          </div>
        </div>
        {cols.map(([t, ls]) => (
          <div key={t}>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">{t}</h4>
            <ul className="space-y-2">
              {ls.map(([l, h]) => <li key={h}><Link href={h} className="text-sm text-slate-600 hover:text-slate-900">{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Edunova. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Built in Nigeria
            <svg width="22" height="15" viewBox="0 0 3 2" aria-label="Nigeria flag" className="rounded-sm border border-slate-200"><rect width="3" height="2" fill="#fff"/><rect width="1" height="2" fill="#008751"/><rect x="2" width="1" height="2" fill="#008751"/></svg>
          </p>
        </div>
      </div>
    </footer>
  );
}
