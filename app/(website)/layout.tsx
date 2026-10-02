import Navbar from '@/components/website/Navbar';
import Footer from '@/components/website/Footer';
import { fontVars } from '@/lib/fonts';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fontVars} min-h-screen bg-white text-slate-900`} style={{ fontFamily: 'var(--font-inter)' }}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
