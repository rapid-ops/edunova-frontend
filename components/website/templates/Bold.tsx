import TemplateBase from './Base';
import type { TemplateProps } from '@/lib/theme';
export default function Bold(p: TemplateProps) {
  return <TemplateBase {...p} variant={{ headerBg: '#0f172a', headerText: '#ffffff' }} />;
}
