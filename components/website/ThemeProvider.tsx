import type { CSSProperties, ReactNode } from 'react';
import { buildCssVars, type ThemeConfig } from '@/lib/theme';
import { fontVars } from '@/lib/fonts';

export default function ThemeProvider({ theme, children }: { theme: ThemeConfig; children: ReactNode }) {
  return (
    <div className={fontVars} style={{ ...buildCssVars(theme), fontFamily: 'var(--font)', background: 'var(--bg)', color: 'var(--text)' } as CSSProperties}>
      {children}
    </div>
  );
}
