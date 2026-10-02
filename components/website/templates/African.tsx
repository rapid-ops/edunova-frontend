import TemplateBase from './Base';
import type { TemplateProps } from '@/lib/theme';
export default function African(p: TemplateProps) {
  return <TemplateBase {...p} variant={{ serif: false, tracking: 'tracking-wide', pattern: 'repeating-linear-gradient(45deg, rgba(217,119,6,.22) 0 10px, transparent 10px 20px), repeating-linear-gradient(-45deg, rgba(194,65,12,.22) 0 10px, transparent 10px 20px)' }} />;
}
