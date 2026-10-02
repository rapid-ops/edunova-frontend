import TemplateBase from './Base';
import type { TemplateProps } from '@/lib/theme';
export default function Minimal(p: TemplateProps) {
  return <TemplateBase {...p} variant={{ headerBg: '#ffffff', headerText: '#000000', tracking: 'tracking-tighter' }} />;
}
