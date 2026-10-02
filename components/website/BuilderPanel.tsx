'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TEMPLATE_PRESETS, type ThemeConfig, type TemplateId, type FontId } from '@/lib/theme';

const TABS = ['Template', 'Colors', 'Fonts', 'Hero', 'Sections'] as const;
const FONTS: [FontId, string][] = [['inter', 'Inter'], ['jakarta', 'Plus Jakarta Sans'], ['sora', 'Sora'], ['poppins', 'Poppins'], ['merriweather', 'Merriweather'], ['dmsans', 'DM Sans']];
const TPL: [TemplateId, string][] = [['modern', 'Modern'], ['bold', 'Bold'], ['minimal', 'Minimal'], ['vibrant', 'Vibrant'], ['professional', 'Professional'], ['african', 'African']];
const SECS = ['hero', 'stats', 'features', 'courses', 'testimonials', 'teachers', 'faq', 'contact', 'footer'] as const;

const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-base';
const Lbl = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">{t}</span>{children}</label>
);
function Choice<T extends string>({ value, opts, on }: { value: T; opts: [T, string][]; on: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(([k, l]) => (
        <button key={k} type="button" onClick={() => on(k)}
          className={`min-h-11 rounded-lg border px-4 text-sm font-medium ${value === k ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{l}</button>
      ))}
    </div>
  );
}

interface P { theme: ThemeConfig; setTheme: (t: ThemeConfig) => void; tagline: string; setTagline: (s: string) => void; logo: string; setLogo: (s: string) => void; }

export default function BuilderPanel({ theme, setTheme, tagline, setTagline, logo, setLogo }: P) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Template');
  const upd = (p: Partial<ThemeConfig>) => setTheme({ ...theme, ...p });
  const c = theme.sections.content;
  const updC = (p: Partial<typeof c>) => setTheme({ ...theme, sections: { ...theme.sections, content: { ...c, ...p } } });

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`min-h-11 whitespace-nowrap px-4 text-sm font-semibold ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Template' && (
        <div className="grid grid-cols-2 gap-3">
          {TPL.map(([k, l]) => {
            const p = TEMPLATE_PRESETS[k];
            return (
              <button key={k} onClick={() => upd({ template: k, ...p })}
                className={`rounded-xl border-2 p-3 text-left ${theme.template === k ? 'border-blue-600' : 'border-slate-200'}`}>
                <div className="mb-2 h-14 rounded-lg" style={{ background: `linear-gradient(135deg, ${p.primary_color}, ${p.secondary_color})` }} />
                <div className="text-sm font-semibold">{l}</div>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'Colors' && (
        <div className="space-y-4">
          <Lbl t="Primary color"><input type="color" value={theme.primary_color} onChange={e => upd({ primary_color: e.target.value })} className="h-12 w-full rounded-lg" /></Lbl>
          <Lbl t="Secondary color"><input type="color" value={theme.secondary_color} onChange={e => upd({ secondary_color: e.target.value })} className="h-12 w-full rounded-lg" /></Lbl>
          <Lbl t="Background">
            <Choice value={theme.background} opts={[['#ffffff', 'White'], ['#f9fafb', 'Gray']]} on={v => upd({ background: v })} />
            <input type="color" value={theme.background} onChange={e => upd({ background: e.target.value })} className="mt-2 h-12 w-full rounded-lg" />
          </Lbl>
          <Lbl t="Button style"><Choice value={theme.button_style} opts={[['filled', 'Filled'], ['outlined', 'Outlined'], ['ghost', 'Ghost']]} on={v => upd({ button_style: v })} /></Lbl>
          <Lbl t="Corners"><Choice value={theme.radius} opts={[['sharp', 'Sharp'], ['soft', 'Soft'], ['round', 'Round']]} on={v => upd({ radius: v })} /></Lbl>
          <Lbl t="Card style"><Choice value={theme.card_style} opts={[['rounded', 'Rounded'], ['sharp', 'Sharp'], ['floating', 'Floating'], ['glass', 'Glass'], ['bordered', 'Bordered']]} on={v => upd({ card_style: v })} /></Lbl>
        </div>
      )}

      {tab === 'Fonts' && <Choice value={theme.font} opts={FONTS} on={v => upd({ font: v })} />}

      {tab === 'Hero' && (
        <div className="space-y-4">
          <Lbl t="Hero style"><Choice value={theme.hero_style} opts={[['centered', 'Centered'], ['split', 'Split'], ['fullscreen', 'Fullscreen'], ['video', 'Video'], ['illustrated', 'Illustrated']]} on={v => upd({ hero_style: v })} /></Lbl>
          <Lbl t="Tagline"><input className={inp} value={tagline} maxLength={160} onChange={e => setTagline(e.target.value)} /></Lbl>
          <Lbl t="Button text"><input className={inp} value={c.hero_cta} maxLength={40} onChange={e => updC({ hero_cta: e.target.value })} /></Lbl>
          <Lbl t="Logo image link (https)"><input className={inp} value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." /></Lbl>
          <Lbl t="Background image link (https)"><input className={inp} value={c.hero_image} onChange={e => updC({ hero_image: e.target.value })} placeholder="https://..." /></Lbl>
          <Lbl t="YouTube embed link (for Video style)"><input className={inp} value={c.video_url} onChange={e => updC({ video_url: e.target.value })} placeholder="https://www.youtube.com/embed/VIDEO_ID" /></Lbl>
        </div>
      )}

      {tab === 'Sections' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2">
            {SECS.map(s => (
              <label key={s} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm capitalize">
                <input type="checkbox" checked={theme.sections[s]} onChange={e => setTheme({ ...theme, sections: { ...theme.sections, [s]: e.target.checked } })} /> {s}
              </label>
            ))}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['students', 'courses', 'teachers', 'years'] as const).map(k => (
                <Lbl key={k} t={k}><input type="number" min={0} className={inp} value={c.stats[k]} onChange={e => updC({ stats: { ...c.stats, [k]: Number(e.target.value) || 0 } })} /></Lbl>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Testimonials</h3>
            {c.testimonials.map((t, i) => (
              <div key={i} className="mb-3 space-y-2 rounded-lg border border-slate-200 p-3">
                <textarea className={inp} placeholder="Quote" value={t.quote} onChange={e => updC({ testimonials: c.testimonials.map((x, j) => j === i ? { ...x, quote: e.target.value } : x) })} />
                <input className={inp} placeholder="Name" value={t.name} onChange={e => updC({ testimonials: c.testimonials.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} />
                <input className={inp} placeholder="Role" value={t.role} onChange={e => updC({ testimonials: c.testimonials.map((x, j) => j === i ? { ...x, role: e.target.value } : x) })} />
                <button className="flex min-h-11 items-center gap-1 text-sm text-red-600" onClick={() => updC({ testimonials: c.testimonials.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" />Remove</button>
              </div>
            ))}
            <button className="flex min-h-11 items-center gap-1 text-sm font-semibold text-blue-600" onClick={() => updC({ testimonials: [...c.testimonials, { quote: '', name: '', role: '' }] })}><Plus className="h-4 w-4" />Add testimonial</button>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">FAQ</h3>
            {c.faq.map((f, i) => (
              <div key={i} className="mb-3 space-y-2 rounded-lg border border-slate-200 p-3">
                <input className={inp} placeholder="Question" value={f.q} onChange={e => updC({ faq: c.faq.map((x, j) => j === i ? { ...x, q: e.target.value } : x) })} />
                <textarea className={inp} placeholder="Answer" value={f.a} onChange={e => updC({ faq: c.faq.map((x, j) => j === i ? { ...x, a: e.target.value } : x) })} />
                <button className="flex min-h-11 items-center gap-1 text-sm text-red-600" onClick={() => updC({ faq: c.faq.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" />Remove</button>
              </div>
            ))}
            <button className="flex min-h-11 items-center gap-1 text-sm font-semibold text-blue-600" onClick={() => updC({ faq: [...c.faq, { q: '', a: '' }] })}><Plus className="h-4 w-4" />Add question</button>
          </div>
        </div>
      )}
    </div>
  );
}
