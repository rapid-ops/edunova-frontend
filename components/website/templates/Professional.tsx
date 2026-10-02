import TemplateBase from './Base';
import type { TemplateProps } from '@/lib/theme';
export default function Professional(p: TemplateProps) {
  return <TemplateBase {...p} variant={{ headerBg: '#065f46', headerText: '#ffffff', table: true }} />;
}
