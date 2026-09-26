import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import HydrateAuth from '@/components/HydrateAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Edunova',
  description: 'Nigerian School LMS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HydrateAuth />
        {children}
      </body>
    </html>
  );
}
