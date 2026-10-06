'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function BrandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ primary_color: '#2563eb', tagline: '', custom_domain: '', logo_url: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user?.school_id) return;
    api.get(`/schools/${user.school_id}`).then(r => {
      const s = r.data.school;
      setForm({
        primary_color: s.primary_color || '#2563eb',
        tagline: s.tagline || '',
        custom_domain: s.custom_domain || '',
        logo_url: s.logo_url || '',
      });
    });
  }, [user]);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put(`/schools/${user?.school_id}/theme`, {
        tagline: form.tagline,
        logo_url: form.logo_url,
        theme_config: { primary_color: form.primary_color },
      });
      setMsg('Saved!');
    } catch { setMsg('Failed to save'); }
    setSaving(false);
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
            <label className="text-xs text-gray-500 mb-1 block">Logo URL</label>
            <input value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })}
              placeholder="https://..." className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            {form.logo_url && <img src={form.logo_url} alt="Logo preview" className="mt-2 h-12 rounded object-contain" />}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
              <input value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })}
                className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tagline</label>
            <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })}
              placeholder="Empowering learners..." className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Custom Domain</label>
            <input value={form.custom_domain} onChange={e => setForm({ ...form, custom_domain: e.target.value })}
              placeholder="learn.yourschool.com" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
          </div>
          <button onClick={save} disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Branding'}
          </button>
          {msg && <p className={`text-sm text-center ${msg === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Custom Domain Setup</p>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-4">
            <li>In your DNS provider, add a <code className="bg-gray-100 px-1 rounded text-xs">CNAME</code> record pointing your domain to <code className="bg-gray-100 px-1 rounded text-xs">cname.vercel-dns.com</code></li>
            <li>Enter your custom domain above and save</li>
            <li>In Vercel, go to your project settings → Domains → Add your domain</li>
            <li>DNS propagation can take up to 48 hours</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
