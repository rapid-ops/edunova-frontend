import type { CSSProperties, ReactNode } from 'react';
import { buildCssVars, type ThemeConfig } from '@/lib/theme';

export default function ThemeProvider({ theme, children }: { theme: ThemeConfig; children: ReactNode }) {
  return (
    <div style={{ ...buildCssVars(theme), fontFamily: 'var(--font)', background: 'var(--bg)', color: 'var(--text)' } as CSSProperties}>
      {children}
    </div>
  );
}
