import TemplateBase from './Base';
import type { TemplateProps } from '@/lib/theme';
export default function Vibrant(p: TemplateProps) {
  return <TemplateBase {...p} variant={{ headerBg: '#7c3aed', headerText: '#ffffff' }} />;
}
