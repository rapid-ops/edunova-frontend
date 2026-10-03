'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TEMPLATE_PRESETS, type ThemeConfig, type TemplateId, type FontId, type Course } from '@/lib/theme';

const TABS = ['Template', 'Colors', 'Fonts', 'Hero', 'Content', 'News', 'People', 'Programmes', 'Gallery', 'Sections'] as const;
const FONTS: [FontId, string][] = [['inter', 'Inter'], ['jakarta', 'Plus Jakarta Sans'], ['sora', 'Sora'], ['poppins', 'Poppins'], ['merriweather', 'Merriweather'], ['dmsans', 'DM Sans']];
const TPL: [TemplateId, string][] = [['modern', 'Modern'], ['bold', 'Bold'], ['minimal', 'Minimal'], ['vibrant', 'Vibrant'], ['professional', 'Professional'], ['african', 'African']];
const SECS = ['hero', 'stats', 'courses', 'testimonials', 'faq', 'contact', 'footer'] as const;

const inp = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900';
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

interface P {
  theme: ThemeConfig; setTheme: (t: ThemeConfig) => void; tagline: string; setTagline: (s: string) => void;
  logo: string; setLogo: (s: string) => void; up: (f: File, done: (url: string) => void) => void; busy: boolean; courses: Course[];
}

function Pic({ url, set, up, busy }: { url: string; set: (u: string) => void; up: P['up']; busy: boolean }) {
  return (
    <div>
      {url && <img src={url} alt="" className="mb-2 h-20 w-20 rounded border border-slate-200 object-cover" />}
      <input type="file" accept="image/*" disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) up(f, set); e.target.value = ''; }} className="block w-full text-sm text-slate-900" />
      {url && <button type="button" className="min-h-11 text-sm text-red-600" onClick={() => set('')}>Remove photo</button>}
    </div>
  );
}
function Card({ children, onDel }: { children: React.ReactNode; onDel: () => void }) {
  return (
    <div className="mb-3 space-y-2 rounded-lg border border-slate-200 p-3">
      {children}
      <button type="button" className="flex min-h-11 items-center gap-1 text-sm text-red-600" onClick={onDel}><Trash2 className="h-4 w-4" />Remove</button>
    </div>
  );
}
function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className="flex min-h-11 items-center gap-1 text-sm font-semibold text-blue-600" onClick={onClick}><Plus className="h-4 w-4" />{label}</button>;
}

export default function BuilderPanel({ theme, setTheme, tagline, setTagline, logo, setLogo, up, busy, courses }: P) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Template');
  const upd = (p: Partial<ThemeConfig>) => setTheme({ ...theme, ...p });
  const c = theme.sections.content;
  const updC = (p: Partial<typeof c>) => setTheme({ ...theme, sections: { ...theme.sections, content: { ...c, ...p } } });
  type L = 'news' | 'events' | 'staff' | 'gallery';
  const setIt = (k: L, i: number, p: Record<string, string>) =>
    updC({ [k]: (c[k] as unknown as Record<string, string>[]).map((x, j) => (j === i ? { ...x, ...p } : x)) } as unknown as Partial<typeof c>);
  const delIt = (k: L, i: number) => updC({ [k]: (c[k] as unknown[]).filter((_, j) => j !== i) } as unknown as Partial<typeof c>);
  const addIt = (k: L, item: Record<string, string>) => updC({ [k]: [...(c[k] as unknown[]), item] } as unknown as Partial<typeof c>);
  const today = new Date().toISOString().slice(0, 10);

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
              <button key={k} onClick={() => upd({ template: k, ...p })} className={`rounded-xl border-2 p-3 text-left ${theme.template === k ? 'border-blue-600' : 'border-slate-200'}`}>
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
        </div>
      )}

      {tab === 'Fonts' && <Choice value={theme.font} opts={FONTS} on={v => upd({ font: v })} />}

      {tab === 'Hero' && (
        <div className="space-y-4">
          <Lbl t="Hero style"><Choice value={theme.hero_style} opts={[['centered', 'Centered'], ['split', 'Left aligned'], ['fullscreen', 'Fullscreen'], ['video', 'Video'], ['illustrated', 'Left aligned 2']]} on={v => upd({ hero_style: v })} /></Lbl>
          <Lbl t="Tagline"><input className={inp} value={tagline} maxLength={160} onChange={e => setTagline(e.target.value)} /></Lbl>
          <Lbl t="Button text"><input className={inp} value={c.hero_cta} maxLength={40} onChange={e => updC({ hero_cta: e.target.value })} /></Lbl>
          <div><span className="mb-1 block text-sm font-medium text-slate-700">School logo / crest</span><Pic url={logo} set={setLogo} up={up} busy={busy} /></div>
          <div><span className="mb-1 block text-sm font-medium text-slate-700">Hero photo</span><Pic url={c.hero_image} set={u => updC({ hero_image: u })} up={up} busy={busy} /></div>
          <Lbl t="YouTube embed link (for Video style)"><input className={inp} value={c.video_url} onChange={e => updC({ video_url: e.target.value })} placeholder="https://www.youtube.com/embed/VIDEO_ID" /></Lbl>
        </div>
      )}

      {tab === 'Content' && (
        <div className="space-y-4">
          <Lbl t="About the school (blank line = new paragraph)"><textarea className={inp} rows={8} maxLength={3000} value={c.about} onChange={e => updC({ about: e.target.value })} /></Lbl>
          <Lbl t="Admissions information"><textarea className={inp} rows={6} maxLength={2000} value={c.admissions} onChange={e => updC({ admissions: e.target.value })} /></Lbl>
        </div>
      )}

      {tab === 'News' && (
        <div className="space-y-8">
          <div>
            <h3 className="mb-2 text-sm font-semibold">News stories</h3>
            {c.news.map((n, i) => (
              <Card key={i} onDel={() => delIt('news', i)}>
                <input className={inp} placeholder="Headline" value={n.title} onChange={e => setIt('news', i, { title: e.target.value })} />
                <input type="date" className={inp} value={n.date} onChange={e => setIt('news', i, { date: e.target.value })} />
                <textarea className={inp} rows={4} placeholder="Story (blank line = new paragraph)" value={n.body} onChange={e => setIt('news', i, { body: e.target.value })} />
                <Pic url={n.image} set={u => setIt('news', i, { image: u })} up={up} busy={busy} />
              </Card>
            ))}
            <AddBtn label="Add news story" onClick={() => addIt('news', { title: '', date: today, body: '', image: '' })} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Upcoming events</h3>
            {c.events.map((n, i) => (
              <Card key={i} onDel={() => delIt('events', i)}>
                <input className={inp} placeholder="Event name" value={n.title} onChange={e => setIt('events', i, { title: e.target.value })} />
                <input type="date" className={inp} value={n.date} onChange={e => setIt('events', i, { date: e.target.value })} />
                <input className={inp} placeholder="Place" value={n.place} onChange={e => setIt('events', i, { place: e.target.value })} />
              </Card>
            ))}
            <AddBtn label="Add event" onClick={() => addIt('events', { title: '', date: today, place: '' })} />
          </div>
        </div>
      )}

      {tab === 'People' && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Leadership and staff</h3>
          {c.staff.map((s, i) => (
            <Card key={i} onDel={() => delIt('staff', i)}>
              <input className={inp} placeholder="Full name" value={s.name} onChange={e => setIt('staff', i, { name: e.target.value })} />
              <input className={inp} placeholder="Role (e.g. Principal)" value={s.role} onChange={e => setIt('staff', i, { role: e.target.value })} />
              <textarea className={inp} rows={3} placeholder="Short bio" value={s.bio} onChange={e => setIt('staff', i, { bio: e.target.value })} />
              <Pic url={s.photo} set={u => setIt('staff', i, { photo: u })} up={up} busy={busy} />
            </Card>
          ))}
          <AddBtn label="Add person" onClick={() => addIt('staff', { name: '', role: '', photo: '', bio: '' })} />
        </div>
      )}

      {tab === 'Programmes' && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Programme details</h3>
          {courses.length === 0 && <p className="text-sm text-slate-600">No published courses yet.</p>}
          {courses.map(k => {
            const id = String(k.id);
            const v = (c.programmes || {})[id] || { duration: '', fees: '', requirements: '' };
            const set = (p: Partial<typeof v>) => updC({ programmes: { ...(c.programmes || {}), [id]: { ...v, ...p } } });
            return (
              <div key={id} className="mb-3 space-y-2 rounded-lg border border-slate-200 p-3">
                <div className="font-semibold">{k.title}</div>
                <input className={inp} placeholder="Duration (e.g. 3 years)" value={v.duration} onChange={e => set({ duration: e.target.value })} />
                <input className={inp} placeholder="Fees (e.g. 150,000 per term)" value={v.fees} onChange={e => set({ fees: e.target.value })} />
                <textarea className={inp} rows={3} placeholder="Entry requirements" value={v.requirements} onChange={e => set({ requirements: e.target.value })} />
              </div>
            );
          })}
        </div>
      )}

      {tab === 'Gallery' && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Photo gallery</h3>
          {c.gallery.map((g, i) => (
            <Card key={i} onDel={() => delIt('gallery', i)}>
              <img src={g.url} alt="" className="h-28 w-full rounded object-cover" />
              <input className={inp} placeholder="Caption" value={g.caption} onChange={e => setIt('gallery', i, { caption: e.target.value })} />
            </Card>
          ))}
          <span className="mb-1 block text-sm font-medium text-slate-700">Add a photo (one at a time)</span>
          <input type="file" accept="image/*" disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) up(f, u => addIt('gallery', { url: u, caption: '' })); e.target.value = ''; }} className="block w-full text-sm text-slate-900" />
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
            <h3 className="mb-2 text-sm font-semibold">Key figures</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['students', 'courses', 'teachers', 'years'] as const).map(k => (
                <Lbl key={k} t={k}><input type="number" min={0} className={inp} value={c.stats[k]} onChange={e => updC({ stats: { ...c.stats, [k]: Number(e.target.value) || 0 } })} /></Lbl>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Testimonials</h3>
            {c.testimonials.map((t, i) => (
              <Card key={i} onDel={() => updC({ testimonials: c.testimonials.filter((_, j) => j !== i) })}>
                <textarea className={inp} placeholder="Quote" value={t.quote} onChange={e => updC({ testimonials: c.testimonials.map((x, j) => j === i ? { ...x, quote: e.target.value } : x) })} />
                <input className={inp} placeholder="Name" value={t.name} onChange={e => updC({ testimonials: c.testimonials.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} />
                <input className={inp} placeholder="Role" value={t.role} onChange={e => updC({ testimonials: c.testimonials.map((x, j) => j === i ? { ...x, role: e.target.value } : x) })} />
              </Card>
            ))}
            <AddBtn label="Add testimonial" onClick={() => updC({ testimonials: [...c.testimonials, { quote: '', name: '', role: '' }] })} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">FAQ</h3>
            {c.faq.map((f, i) => (
              <Card key={i} onDel={() => updC({ faq: c.faq.filter((_, j) => j !== i) })}>
                <input className={inp} placeholder="Question" value={f.q} onChange={e => updC({ faq: c.faq.map((x, j) => j === i ? { ...x, q: e.target.value } : x) })} />
                <textarea className={inp} placeholder="Answer" value={f.a} onChange={e => updC({ faq: c.faq.map((x, j) => j === i ? { ...x, a: e.target.value } : x) })} />
              </Card>
            ))}
            <AddBtn label="Add question" onClick={() => updC({ faq: [...c.faq, { q: '', a: '' }] })} />
          </div>
        </div>
      )}
    </div>
  );
}
