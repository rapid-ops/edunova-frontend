'use client';
import { useEffect, useState } from 'react';
import { Save, ExternalLink, Eye, Pencil } from 'lucide-react';
import api from '@/lib/api';
import { mergeTheme, type ThemeConfig, type School, type Course } from '@/lib/theme';
import { templates } from '@/components/website/templates';
import ThemeProvider from '@/components/website/ThemeProvider';
import BuilderPanel from '@/components/website/BuilderPanel';

export default function WebsiteBuilder() {
  const [school, setSchool] = useState<School | null>(null);
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tagline, setTagline] = useState('');
  const [logo, setLogo] = useState('');
  const [ext, setExt] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    (async () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        const id = new URLSearchParams(window.location.search).get('school') || u.school_id;
        if (!id) { setMsg('No school linked to this account.'); return; }
        const r = await api.get(`/schools/${id}`);
        const s: School = r.data.school;
        setSchool(s); setTagline(s.tagline || ''); setLogo(s.logo_url || ''); setExt((s as any).external_website_url || '');
        setTheme(mergeTheme(s.theme_config));
        try {
          const cr = await api.get(`/courses/school/${id}`);
          const list = Array.isArray(cr.data) ? cr.data : cr.data.courses || [];
          setCourses(list.filter((x: any) => x.is_published !== false && x.status !== 'draft'));
        } catch {}
      } catch (e: any) { setMsg(e?.response?.data?.error || 'Could not load school.'); }
    })();
  }, []);

  const save = async () => {
    if (!school || !theme) return;
    setSaving(true); setMsg('');
    try {
      await api.put(`/schools/${school.id}/theme`, { theme_config: theme, tagline, logo_url: logo });
      setMsg('Saved. Your public page is updated.');
    } catch (e: any) { setMsg(e?.response?.data?.error || 'Save failed.'); }
    setSaving(false);
  };

  const saveExt = async () => {
    if (!school) return;
    const v = ext.trim();
    if (v && !v.startsWith('https://')) { setMsg('Link must start with https://'); return; }
    try {
      await api.put('/schools/' + school.id + '/website', { external_website_url: v || null, website_config: null });
      setMsg(v ? 'Your public page now redirects to your website.' : 'Redirect removed. Your Edunova page is active.');
    } catch (e: any) { setMsg(e?.response?.data?.error || 'Save failed.'); }
  };

  if (!school || !theme) return <div className="p-6 text-slate-600">{msg || 'Loading...'}</div>;

  const preview = { ...school, tagline, logo_url: logo && /^https:\/\//.test(logo) ? logo : undefined };
  const Template = templates[theme.template];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Website Builder</h1>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`/school/${school.subdomain}`} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 px-4 text-sm font-medium"><ExternalLink className="h-4 w-4" />Open live</a>
          <button onClick={save} disabled={saving} className="flex min-h-11 items-center gap-1 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
      {msg && <div className="mb-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-800">{msg}</div>}
      <div className="mb-4 rounded-lg border border-slate-200 p-4">
        <div className="mb-2 text-sm font-semibold">Already have a website? Redirect visitors to it</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base" value={ext} onChange={e => setExt(e.target.value)} placeholder="https://yourschool.com (empty = use this builder)" />
          <button onClick={saveExt} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold">Save link</button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 lg:hidden">
        <button onClick={() => setView('edit')} className={`flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg text-sm font-semibold ${view === 'edit' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}><Pencil className="h-4 w-4" />Edit</button>
        <button onClick={() => setView('preview')} className={`flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg text-sm font-semibold ${view === 'preview' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}><Eye className="h-4 w-4" />Preview</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={view === 'edit' ? 'block' : 'hidden lg:block'}>
          <BuilderPanel theme={theme} setTheme={setTheme} tagline={tagline} setTagline={setTagline} logo={logo} setLogo={setLogo} />
        </div>
        <div className={view === 'preview' ? 'block' : 'hidden lg:block'}>
          <div className="mx-auto h-[70vh] w-full max-w-[420px] overflow-y-auto rounded-3xl border-4 border-slate-800 bg-white">
            <ThemeProvider theme={theme}>
              <Template school={preview} courses={courses} theme={theme} sections={theme.sections} />
            </ThemeProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
