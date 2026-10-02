import Modern from './Modern';
import Bold from './Bold';
import Minimal from './Minimal';
import Vibrant from './Vibrant';
import Professional from './Professional';
import African from './African';
import type { TemplateId, TemplateProps } from '@/lib/theme';

export const templates: Record<TemplateId, (p: TemplateProps) => React.JSX.Element> = {
  modern: Modern, bold: Bold, minimal: Minimal, vibrant: Vibrant, professional: Professional, african: African,
};
