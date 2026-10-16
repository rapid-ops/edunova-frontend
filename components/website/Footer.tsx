import Link from 'next/link';
import Logo from '@/components/Logo';

const links = [['Home', '/'], ['Features', '/features'], ['For Schools', '/#schools'], ['For Teachers', '/#teachers'], ['For Students', '/#students'], ['Pricing', '/pricing'], ['Contact', '/contact']];

const socials: [string, string, string][] = [
  ['Facebook', 'https://facebook.com', 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z'],
  ['X', 'https://x.com', 'M18.244 2H21l-6.52 7.45L22 22h-6.17l-4.83-6.32L5.5 22H2.74l6.97-7.97L2 2h6.33l4.37 5.78L18.244 2zm-1.08 18h1.53L7.02 3.9H5.38L17.164 20z'],
  ['Instagram', 'https://instagram.com', 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.5 6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z'],
  ['YouTube', 'https://youtube.com', 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z'],
];

export function NigeriaFlag() {
  return (
    <svg width="14" height="14" viewBox="0 0 3 3" aria-label="Nigeria flag" className="rounded-sm"><rect width="3" height="3" fill="#fff" /><rect width="1" height="3" fill="#008751" /><rect x="2" width="1" height="3" fill="#008751" /></svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 lg:flex-row">
        <Logo size={34} />
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map(([l, h]) => <Link key={h} href={h} className="text-xs text-slate-700 hover:text-blue-600">{l}</Link>)}
        </div>
        <div className="flex gap-4">
          {socials.map(([n, h, d]) => (
            <a key={n} href={h} target="_blank" rel="noopener noreferrer" aria-label={n} className="text-[#0b1a4a] hover:text-blue-600">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={d} /></svg>
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-[11px] text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Edunova. All rights reserved.</p>
          <p className="flex items-center gap-1.5">Built for Nigerian Schools <NigeriaFlag /></p>
        </div>
      </div>
    </footer>
  );
}
