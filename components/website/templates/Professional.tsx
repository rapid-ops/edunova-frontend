import TemplateBase from './Base';
import type { TemplateProps } from '@/lib/theme';
export default function Professional(p: TemplateProps) {
  return <TemplateBase {...p} variant={{ serif: true, table: true }} />;
}
