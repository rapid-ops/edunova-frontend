export type TemplateId = 'modern' | 'bold' | 'minimal' | 'vibrant' | 'professional' | 'african';
export type FontId = 'inter' | 'jakarta' | 'sora' | 'poppins' | 'merriweather' | 'dmsans';
export type Radius = 'sharp' | 'soft' | 'round';

export interface SectionConfig {
  hero: boolean; stats: boolean; features: boolean; courses: boolean;
  testimonials: boolean; teachers: boolean; faq: boolean; contact: boolean; footer: boolean;
  content: {
    hero_cta: string; hero_image: string; video_url: string; about: string; admissions: string;
    stats: { students: number; courses: number; teachers: number; years: number };
    testimonials: { quote: string; name: string; role: string }[];
    faq: { q: string; a: string }[];
  };
}

export interface ThemeConfig {
  template: TemplateId; primary_color: string; secondary_color: string;
  font: FontId; hero_style: 'centered' | 'split' | 'fullscreen' | 'video' | 'illustrated';
  card_style: 'rounded' | 'sharp' | 'floating' | 'glass' | 'bordered';
  radius: Radius; button_style: 'filled' | 'outlined' | 'ghost';
  background: string; sections: SectionConfig;
}

export interface School { id: string; name: string; subdomain: string; tagline?: string; logo_url?: string; email?: string; phone?: string; address?: string; theme_config?: Partial<ThemeConfig>; }
export interface Course { id: string; title: string; description?: string; thumbnail_url?: string; }
export interface TemplateProps { school: School; courses: Course[]; theme: ThemeConfig; sections: SectionConfig; }

export const DEFAULT_SECTIONS: SectionConfig = {
  hero: true, stats: true, features: true, courses: true, testimonials: true,
  teachers: true, faq: true, contact: true, footer: true,
  content: { hero_cta: 'Apply now', hero_image: '', video_url: '', about: '', admissions: '',
    stats: { students: 0, courses: 0, teachers: 0, years: 1 }, testimonials: [], faq: [] },
};

export const DEFAULT_THEME: ThemeConfig = {
  template: 'modern', primary_color: '#2563eb', secondary_color: '#10b981',
  font: 'inter', hero_style: 'centered', card_style: 'rounded', radius: 'soft',
  button_style: 'filled', background: '#ffffff', sections: DEFAULT_SECTIONS,
};

// Template presets: applied when admin picks a template
export const TEMPLATE_PRESETS: Record<TemplateId, Partial<ThemeConfig>> = {
  modern: { primary_color: '#2563eb', secondary_color: '#10b981', font: 'inter', hero_style: 'split', card_style: 'rounded', radius: 'soft', background: '#ffffff' },
  bold: { primary_color: '#f97316', secondary_color: '#0f172a', font: 'poppins', hero_style: 'fullscreen', card_style: 'sharp', radius: 'sharp', background: '#ffffff' },
  minimal: { primary_color: '#000000', secondary_color: '#6b7280', font: 'dmsans', hero_style: 'centered', card_style: 'bordered', radius: 'soft', background: '#ffffff' },
  vibrant: { primary_color: '#fbbf24', secondary_color: '#7c3aed', font: 'jakarta', hero_style: 'illustrated', card_style: 'floating', radius: 'round', background: '#fffbeb' },
  professional: { primary_color: '#065f46', secondary_color: '#d1fae5', font: 'merriweather', hero_style: 'split', card_style: 'sharp', radius: 'sharp', background: '#ffffff' },
  african: { primary_color: '#c2410c', secondary_color: '#d97706', font: 'sora', hero_style: 'fullscreen', card_style: 'bordered', radius: 'soft', background: '#fef3c7' },
};

export const FONT_VARS: Record<FontId, string> = {
  inter: 'var(--font-inter)', jakarta: 'var(--font-jakarta)', sora: 'var(--font-sora)',
  poppins: 'var(--font-poppins)', merriweather: 'var(--font-merriweather)', dmsans: 'var(--font-dmsans)',
};

const HEX = /^#[0-9a-fA-F]{6}$/;
export const safeHex = (v: unknown, fallback: string) => (typeof v === 'string' && HEX.test(v) ? v : fallback);

// Allow only YouTube embed URLs for the video hero
export const safeVideoUrl = (v: string) =>
  /^https:\/\/(www\.)?(youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)[\w-]+/.test(v) ? v : '';

export function contrastText(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#0f172a' : '#ffffff';
}

// Merge DB value over defaults, validating anything that reaches CSS
export function mergeTheme(raw?: Partial<ThemeConfig> | null): ThemeConfig {
  const t = { ...DEFAULT_THEME, ...(raw || {}) } as ThemeConfig;
  const s = (raw?.sections || {}) as Partial<SectionConfig>;
  t.sections = { ...DEFAULT_SECTIONS, ...s, content: { ...DEFAULT_SECTIONS.content, ...(s.content || {}) } };
  t.sections.content.video_url = safeVideoUrl(t.sections.content.video_url || '');
  t.primary_color = safeHex(t.primary_color, DEFAULT_THEME.primary_color);
  t.secondary_color = safeHex(t.secondary_color, DEFAULT_THEME.secondary_color);
  t.background = safeHex(t.background, '#ffffff');
  if (!(t.font in FONT_VARS)) t.font = 'inter';
  if (!(t.template in TEMPLATE_PRESETS)) t.template = 'modern';
  return t;
}

export function buildCssVars(t: ThemeConfig): Record<string, string> {
  const card = t.card_style === 'sharp' ? '0px' : t.radius === 'sharp' ? '0px' : t.radius === 'round' ? '24px' : '12px';
  const btn = t.radius === 'sharp' ? '0px' : t.radius === 'round' ? '999px' : '8px';
  return {
    '--primary': t.primary_color, '--on-primary': contrastText(t.primary_color),
    '--secondary': t.secondary_color, '--bg': t.background, '--text': contrastText(t.background),
    '--font': FONT_VARS[t.font], '--radius-card': card, '--radius-btn': btn,
  };
}
