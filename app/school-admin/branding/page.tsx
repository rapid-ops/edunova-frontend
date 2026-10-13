'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const inp = 'w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none';
const errMsg = (e: any) => e?.response?.data?.error || e?.message || 'Request failed';

export default function BrandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const sid = user?.school_id;
  const [form, setForm] = useState({ primary_color: '#2563eb', tagline: '', custom_domain: '', logo_url: '' });
  const [theme, setTheme] = useState<any>(null);
  const [sub, setSub] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!sid) return;
    (async () => {
      try {
        let s: any = (await api.get(`/schools/${sid}`)).data.school || {};
        if (s.theme_config === undefined && s.subdomain) {
          const p = await api.get(`/schools/subdomain/${s.subdomain}`);
          s = { ...s, ...(p.data.school || {}) };
        }
        if (s.theme_config === undefined) { setMsg({ ok: false, text: 'Could not load the current theme. Saving is disabled.' }); return; }
        const t = s.theme_config || {};
        setTheme(t); setSub(s.subdomain || '');
        setForm({ primary_color: t.primary_color || s.primary_color || '#2563eb', tagline: s.tagline || '', custom_domain: s.custom_domain || '', logo_url: s.logo_url || '' });
      } catch (e) { setMsg({ ok: false, text: errMsg(e) }); }
    })();
  }, [sid]);

  const save = async () => {
    if (!theme) return;
    if (!/^#[0-9a-fA-F]{6}$/.test(form.primary_color)) { setMsg({ ok: false, text: 'Color must look like #2563eb' }); return; }
    setSaving(true); setMsg(null);
    try {
      await api.put(`/schools/${sid}/domain`, { custom_domain: form.custom_domain });
      const next = { ...theme, primary_color: form.primary_color };
      await api.put(`/schools/${sid}/theme`, { tagline: form.tagline, logo_url: form.logo_url, theme_config: next });
      setTheme(next);
      setMsg({ ok: true, text: 'Saved. The public page updates within 30 seconds.' });
    } catch (e) { setMsg({ ok: false, text: errMsg(e) }); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm text-blue-600">← Back</button>
        <h1 className="text-lg font-bold text-gray-900">School Branding</h1>
      </div>
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Logo URL (https)</label>
            <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." className={inp} />
            {form.logo_url && <img src={form.logo_url} alt="Logo preview" className="mt-2 h-12 rounded object-contain" />}
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Primary color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.primary_color) ? form.primary_color : '#2563eb'} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
              <input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className={inp + ' font-mono flex-1'} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Tagline</label>
            <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Empowering learners..." className={inp} />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Custom domain</label>
            <input value={form.custom_domain} onChange={(e) => setForm({ ...form, custom_domain: e.target.value })} placeholder="learn.yourschool.com" className={inp} />
          </div>
          <button onClick={save} disabled={saving || !theme} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save branding'}</button>
          {msg && <p className={`text-sm text-center ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</p>}
          {sub && <a href={`/school/${sub}`} target="_blank" className="block text-center text-sm text-blue-600">View public page</a>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Custom domain setup</p>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal pl-4">
            <li>At your DNS provider add a CNAME record pointing your domain to <code className="bg-gray-100 px-1 rounded text-xs">cname.vercel-dns.com</code></li>
            <li>Enter the domain above and save</li>
            <li>In Vercel: project Settings, Domains, add the same domain and wait for verification</li>
            <li>DNS can take up to 48 hours</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
