'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function WebsitePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.school_id;
  const [school, setSchool] = useState<any>(null);
  const [mode, setMode] = useState<'builder' | 'external'>('builder');
  const [externalUrl, setExternalUrl] = useState('');
  const [form, setForm] = useState({
    tagline: '',
    about: '',
    address: '',
    phone: '',
    email: '',
    primary_color: '#1d4ed8',
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    try {
      const res = await api.get(`/schools/${schoolId}`);
      const s = res.data.school;
      setSchool(s);
      if (s.external_website_url) {
        setExternalUrl(s.external_website_url);
        setMode('external');
      }
      if (s.website_config) {
        setForm(JSON.parse(s.website_config));
      }
    } catch (err) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/schools/${schoolId}/website`, {
        mode,
        external_website_url: mode === 'external' ? externalUrl : null,
        website_config: mode === 'builder' ? JSON.stringify(form) : null,
      });
      setSuccess('Website settings saved');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold">School Website</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg mb-4">{success}</div>}

        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('builder')} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'builder' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400'}`}>Build Website</button>
          <button onClick={() => setMode('external')} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'external' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400'}`}>Use Existing Website</button>
        </div>

        {mode === 'external' ? (
          <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold">Link Your Existing Website</h2>
            <p className="text-gray-400 text-sm">Students and parents will be redirected to your website.</p>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Website URL</label>
              <input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://yourschool.edu.ng"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold">Customize Your School Website</h2>
            <p className="text-gray-400 text-sm">Your website will be live at: <span className="text-blue-400">{`edunova-frontend-gkaj.vercel.app/school/${school?.subdomain}`}</span></p>

            {[
              { key: 'tagline', label: 'Tagline', placeholder: 'Shaping tomorrow\'s leaders today' },
              { key: 'about', label: 'About School', placeholder: 'Brief description of your school...' },
              { key: 'address', label: 'Address', placeholder: '123 School Street, Lagos' },
              { key: 'phone', label: 'Phone', placeholder: '08012345678' },
              { key: 'email', label: 'Email', placeholder: 'info@school.edu.ng' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-gray-400 text-sm mb-1 block">{f.label}</label>
                {f.key === 'about' ? (
                  <textarea
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0" />
                <span className="text-gray-400 text-sm">{form.primary_color}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50">
                {loading ? 'Saving...' : 'Save & Publish'}
              </button>
              {school?.subdomain && (
                <a href={`/school/${school.subdomain}`} target="_blank" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm">
                  Preview
                </a>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
