import { Inter, Plus_Jakarta_Sans, Sora, Poppins, Merriweather, DM_Sans } from 'next/font/google';
import Navbar from '@/components/website/Navbar';
import Footer from '@/components/website/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-poppins', display: 'swap' });
const merri = Merriweather({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-merriweather', display: 'swap' });
const dmsans = DM_Sans({ subsets: ['latin'], variable: '--font-dmsans', display: 'swap' });

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const vars = [inter, jakarta, sora, poppins, merri, dmsans].map(f => f.variable).join(' ');
  return (
    <div className={`${vars} min-h-screen bg-white text-slate-900`} style={{ fontFamily: 'var(--font-inter)' }}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
