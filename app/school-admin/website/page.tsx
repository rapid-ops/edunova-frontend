'use client';
import { useEffect, useRef, useState } from 'react';
import { Globe, Eye, Pencil, Save, Rocket, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, ImagePlus, Copy } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { preparePhoto, PhotoError } from '@/lib/imageprep';

type FieldDef = { key: string; label: string; type: string; required?: boolean; default?: string };
type ListDef = { key: string; label: string; max?: number; fields: FieldDef[] };
type Schema = { slug: string; name: string; description: string; fields: FieldDef[]; lists: ListDef[] };
type Tpl = { slug: string; name: string; description: string; primary_color?: string; accent_color?: string };
type Vals = Record<string, string>;
type Data = { fields: Vals; lists: Record<string, Vals[]> };
type Msg = { ok: boolean; text: string } | null;

const box = 'w-full min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900';
const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-50';

const buildData = (sc: Schema, base?: Data | null, defaults?: Vals): Data => {
  const fields: Vals = {};
  sc.fields.forEach((f) => { fields[f.key] = base?.fields?.[f.key] ?? (defaults?.[f.key] || f.default || ''); });
  const lists: Record<string, Vals[]> = {};
  sc.lists.forEach((l) => {
    lists[l.key] = (base?.lists?.[l.key] || []).map((it) => {
      const o: Vals = {};
      l.fields.forEach((f) => { o[f.key] = it?.[f.key] ?? ''; });
      return o;
    });
  });
  return { fields, lists };
};

function ImageField({ value, onChange, schoolId, label }: { value: string; onChange: (v: string) => void; schoolId: unknown; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true); setErr('');
    try {
      const ready = await preparePhoto(f, 1600);
      const fd = new FormData();
      fd.append('file', ready);
      const r = await api.post(`/schoolimages/website-image/${schoolId}`, fd);
      const url = r.data?.url;
      if (typeof url !== 'string' || !url.startsWith('https://')) throw new Error('bad');
      onChange(url);
    } catch (x: any) {
      setErr(x instanceof PhotoError ? x.message
        : x?.response?.status === 413 ? 'This photo is too big. Choose a smaller one.'
        : x?.response?.status === 403 ? 'You cannot upload photos for this school.'
        : 'We could not upload that photo. Please try again.');
    } finally { setBusy(false); }
  };
  return (
    <div className="space-y-2">
      {value && <img src={value} alt="" className="h-28 w-full rounded-lg border border-gray-200 bg-gray-50 object-contain" />}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className={`${btn} border border-gray-300 bg-white text-gray-800`}>
          <ImagePlus size={16} />{busy ? 'Uploading...' : value ? 'Change photo' : 'Choose a photo'}
        </button>
        {value && !busy && <button type="button" onClick={() => onChange('')} className={`${btn} border border-red-200 bg-white text-red-600`}>Remove</button>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} aria-label={label} />
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}

function Field({ def, value, onChange, schoolId }: { def: FieldDef; value: string; onChange: (v: string) => void; schoolId: unknown }) {
  if (def.type === 'image') return <ImageField value={value} onChange={onChange} schoolId={schoolId} label={def.label} />;
  if (def.type === 'textarea') return <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} aria-label={def.label} className={box} />;
  if (def.type === 'color') {
    return (
      <div className="flex gap-2">
        <input type="color" aria-label={def.label} value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 shrink-0 rounded-lg border border-gray-200 bg-white p-1" />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#142B49" aria-label={def.label + ' code'} className={box} />
      </div>
    );
  }
  const type = def.type === 'phone' ? 'tel' : def.type === 'email' ? 'email' : def.type === 'url' ? 'url' : def.type === 'number' ? 'number' : def.type === 'date' ? 'date' : 'text';
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} aria-label={def.label} className={box} />;
}

function FieldRow({ def, value, onChange, schoolId }: { def: FieldDef; value: string; onChange: (v: string) => void; schoolId: unknown }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-gray-700">{def.label}{def.required ? ' *' : ''}</p>
      <Field def={def} value={value} onChange={onChange} schoolId={schoolId} />
    </div>
  );
}

function ListEditor({ def, items, onChange, schoolId }: { def: ListDef; items: Vals[]; onChange: (v: Vals[]) => void; schoolId: unknown }) {
  const max = def.max || 8;
  const blank = () => { const o: Vals = {}; def.fields.forEach((f) => { o[f.key] = ''; }); return o; };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  const icon = 'flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 disabled:opacity-30';
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">{def.label} <span className="font-normal text-gray-400">({items.length} of {max})</span></p>
        <button type="button" onClick={() => onChange([...items, blank()])} disabled={items.length >= max} className={`${btn} bg-blue-600 text-white`}><Plus size={16} />Add</button>
      </div>
      {items.length === 0 && <p className="text-sm text-gray-500">Nothing added yet.</p>}
      {items.map((it, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <div className="flex items-center justify-end gap-1">
            <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className={icon}><ArrowUp size={18} /></button>
            <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={icon}><ArrowDown size={18} /></button>
            <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, xi) => xi !== i))} className={icon + ' text-red-500'}><Trash2 size={18} /></button>
          </div>
          {def.fields.map((f) => (
            <FieldRow key={f.key} def={f} value={it[f.key] || ''} schoolId={schoolId}
              onChange={(v) => onChange(items.map((x, xi) => (xi === i ? { ...x, [f.key]: v } : x)))} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function MyWebsitePage() {
  const { user } = useAuthStore();
  const schoolId = (user as any)?.school_id;
  const [tpls, setTpls] = useState<Tpl[]>([]);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [defaults, setDefaults] = useState<Vals>({});
  const [sub, setSub] = useState('');
  const [step, setStep] = useState<'styles' | 'edit'>('styles');
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [msg, setMsg] = useState<Msg>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [askOff, setAskOff] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pub, setPub] = useState<{ on: boolean; at: string | null }>({ on: false, at: null });
  const [html, setHtml] = useState('');
  const [previewBusy, setPreviewBusy] = useState(false);
  const [origin, setOrigin] = useState('');
  const base = String(api.defaults.baseURL || '').replace(/\/+$/, '');

  useEffect(() => { setOrigin(window.location.origin); }, []);

  useEffect(() => {
    (async () => {
      try {
        const [t, m] = await Promise.all([api.get('/schoolsites/templates'), api.get('/schoolsites/mine')]);
        setTpls(t.data.templates || []);
        const d: Vals = m.data?.defaults?.fields || {};
        setDefaults(d);
        setSub(m.data?.subdomain || '');
        const site = m.data?.site;
        if (site) {
          setPub({ on: !!site.is_published, at: site.published_at || null });
          if (site.template_slug) {
            const s = await api.get(`/schoolsites/templates/${site.template_slug}`);
            const sc: Schema = s.data.template;
            setSchema(sc);
            setData(buildData(sc, site.draft, d));
            setStep('edit');
          }
        }
      } catch (e: any) {
        setLoadErr(e?.response?.data?.error || 'We could not load your website settings. Please refresh and try again.');
      } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (view !== 'preview' || !schema || !data) return;
    const t = setTimeout(async () => {
      setPreviewBusy(true);
      try {
        const r = await api.post('/schoolsites/preview', { template_slug: schema.slug, data });
        setHtml(r.data.html || '');
      } catch { setMsg({ ok: false, text: 'We could not load the preview. Please try again.' }); }
      finally { setPreviewBusy(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [view, schema, data]);

  const choose = async (slug: string) => {
    setMsg(null);
    try {
      const r = await api.get(`/schoolsites/templates/${slug}`);
      const sc: Schema = r.data.template;
      setSchema(sc);
      setData(buildData(sc, data, defaults));
      setStep('edit'); setView('edit'); setDirty(true);
    } catch { setMsg({ ok: false, text: 'We could not open that style. Please try again.' }); }
  };

  const setField = (k: string, v: string) => { setData((d) => (d ? { ...d, fields: { ...d.fields, [k]: v } } : d)); setDirty(true); };
  const setList = (k: string, items: Vals[]) => { setData((d) => (d ? { ...d, lists: { ...d.lists, [k]: items } } : d)); setDirty(true); };

  const missing = (schema?.fields || []).filter((f) => f.required && !(data?.fields[f.key] || '').trim()).map((f) => f.label);

  const save = async (): Promise<boolean> => {
    if (!schema || !data) return false;
    setSaving(true); setMsg(null);
    try {
      await api.put('/schoolsites/mine', { template_slug: schema.slug, data });
      setDirty(false);
      setMsg({ ok: true, text: 'Your draft is saved.' });
      return true;
    } catch (e: any) {
      setMsg({ ok: false, text: e?.response?.data?.error || 'We could not save. Please try again.' });
      return false;
    } finally { setSaving(false); }
  };

  const publish = async () => {
    if (missing.length) { setMsg({ ok: false, text: 'Please fill in: ' + missing.join(', ') + '.' }); return; }
    if (!(await save())) return;
    setPublishing(true);
    try {
      const r = await api.post('/schoolsites/publish');
      if (r.data?.subdomain) setSub(r.data.subdomain);
      setPub({ on: true, at: new Date().toISOString() });
      setMsg({ ok: true, text: 'Your website is live.' });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.response?.data?.error || 'We could not publish. Please try again.' });
    } finally { setPublishing(false); }
  };

  const unpublish = async () => {
    setPublishing(true);
    try {
      await api.post('/schoolsites/unpublish');
      setPub({ on: false, at: null }); setAskOff(false);
      setMsg({ ok: true, text: 'Your website is no longer public. Your draft is kept.' });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.response?.data?.error || 'We could not do that. Please try again.' });
    } finally { setPublishing(false); }
  };

  const liveUrl = origin && sub ? `${origin}/site/${sub}` : '';
  const copy = async () => {
    try { await navigator.clipboard.writeText(liveUrl); setMsg({ ok: true, text: 'Link copied.' }); }
    catch { setMsg({ ok: false, text: 'We could not copy the link. Press and hold it to copy.' }); }
  };

  const tab = (on: boolean) => `${btn} flex-1 ${on ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-800'}`;

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  if (loadErr) return <div className="p-6 text-sm text-red-600">{loadErr}</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><Globe className="h-6 w-6 text-blue-600" />My website</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pub.on ? 'bg-green-100 text-green-700' : schema ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
          {pub.on ? 'Published' : schema ? 'Draft' : 'Not started'}
        </span>
      </div>

      {msg && <div className={`rounded-xl border p-3 text-sm ${msg.ok ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-600'}`}>{msg.text}</div>}

      {pub.on && liveUrl && (
        <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">Your website is live</p>
          <p className="break-all text-sm text-green-800">{liveUrl}</p>
          <div className="flex flex-wrap gap-2">
            <a href={`/site/${sub}`} target="_blank" rel="noopener noreferrer" className={`${btn} bg-blue-600 text-white`}><ExternalLink size={16} />View live site</a>
            <button type="button" onClick={copy} className={`${btn} border border-gray-300 bg-white text-gray-800`}><Copy size={16} />Copy link</button>
          </div>
          <p className="text-xs text-green-800">After you change something, save and publish again to update the live site.</p>
        </div>
      )}

      {step === 'styles' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Choose a style for your school website. You can change it later and your details are kept.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tpls.map((t) => (
              <div key={t.slug} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex h-10 overflow-hidden rounded-lg border border-gray-100">
                  <div className="flex-1" style={{ background: t.primary_color || '#1e3a8a' }} />
                  <div className="w-1/3" style={{ background: t.accent_color || '#d8b56d' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`${base}/schoolsites/templates/${t.slug}/preview`} target="_blank" rel="noopener noreferrer" className={`${btn} border border-gray-300 bg-white text-gray-800`}><Eye size={16} />See example</a>
                  <button type="button" onClick={() => choose(t.slug)} className={`${btn} bg-blue-600 text-white`}>{schema?.slug === t.slug ? 'Keep this style' : 'Use this style'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'edit' && schema && data && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-sm text-gray-700">Style: <span className="font-semibold">{schema.name}</span></p>
            <button type="button" onClick={() => setStep('styles')} className={`${btn} border border-gray-300 bg-white text-gray-800`}>Change style</button>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setView('edit')} className={tab(view === 'edit')}><Pencil size={16} />Details</button>
            <button type="button" onClick={() => setView('preview')} className={tab(view === 'preview')}><Eye size={16} />Preview</button>
          </div>

          {view === 'edit' && (
            <div className="space-y-4">
              <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
                {schema.fields.map((f) => (
                  <FieldRow key={f.key} def={f} value={data.fields[f.key] || ''} onChange={(v) => setField(f.key, v)} schoolId={schoolId} />
                ))}
              </div>
              {schema.lists.map((l) => (
                <ListEditor key={l.key} def={l} items={data.lists[l.key] || []} onChange={(v) => setList(l.key, v)} schoolId={schoolId} />
              ))}
            </div>
          )}

          {view === 'preview' && (
            <div className="space-y-2">
              {previewBusy && <p className="text-sm text-gray-500">Updating the preview...</p>}
              <iframe title="Preview of your website" srcDoc={html} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" className="h-[70vh] w-full rounded-xl border border-gray-200 bg-white" />
            </div>
          )}

          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            {dirty && <p className="text-sm text-yellow-700">You have changes that are not saved yet.</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={save} disabled={saving || publishing} className={`${btn} border border-gray-300 bg-white text-gray-800`}><Save size={16} />{saving ? 'Saving...' : 'Save draft'}</button>
              <button type="button" onClick={publish} disabled={saving || publishing} className={`${btn} bg-blue-600 text-white`}><Rocket size={16} />{publishing ? 'Publishing...' : pub.on ? 'Save and publish again' : 'Publish'}</button>
            </div>
            {pub.on && !askOff && <button type="button" onClick={() => setAskOff(true)} className="min-h-11 text-sm font-medium text-red-600">Take my website offline</button>}
            {askOff && (
              <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">Visitors will no longer see your website. Your draft is kept.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={unpublish} disabled={publishing} className={`${btn} bg-red-600 text-white`}>Take it offline</button>
                  <button type="button" onClick={() => setAskOff(false)} className={`${btn} border border-gray-300 bg-white text-gray-800`}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
