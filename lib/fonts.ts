import { Inter, Plus_Jakarta_Sans, Sora, Poppins, Merriweather, DM_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-poppins', display: 'swap' });
const merri = Merriweather({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-merriweather', display: 'swap' });
const dmsans = DM_Sans({ subsets: ['latin'], variable: '--font-dmsans', display: 'swap' });

export const fontVars = [inter, jakarta, sora, poppins, merri, dmsans].map(f => f.variable).join(' ');
