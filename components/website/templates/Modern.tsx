import TemplateBase from './Base';
import type { TemplateProps } from '@/lib/theme';
export default function Modern(p: TemplateProps) {
  return <TemplateBase {...p} variant={{ headerBg: '#ffffff', headerText: '#0f172a' }} />;
}
