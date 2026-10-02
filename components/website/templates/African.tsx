import TemplateBase from './Base';
import type { TemplateProps } from '@/lib/theme';
export default function African(p: TemplateProps) {
  return <TemplateBase {...p} variant={{ headerBg: '#1c1917', headerText: '#fef3c7', heroBg: '#1c1917', heroText: '#fef3c7', tracking: 'tracking-wide', pattern: 'repeating-linear-gradient(45deg, rgba(217,119,6,.28) 0 10px, transparent 10px 20px), repeating-linear-gradient(-45deg, rgba(194,65,12,.28) 0 10px, transparent 10px 20px)' }} />;
}
