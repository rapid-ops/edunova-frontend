import TemplateBase from './Base';
import type { TemplateProps } from '@/lib/theme';
export default function Minimal(p: TemplateProps) {
  return <TemplateBase {...p} variant={{ serif: false, tracking: 'tracking-tighter' }} />;
}
