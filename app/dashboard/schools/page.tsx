'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface School {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  subdomain: string;
  subscription_plan: string;
  is_active: boolean;
}

export default function SchoolsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', subdomain: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data.schools);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/schools', form);
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', address: '', subdomain: '' });
      fetchSchools();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create school');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-xl font-bold">Schools</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          + Add School
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="font-semibold">New School</h2>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {[
              { key: 'name', placeholder: 'School name', label: 'Name' },
              { key: 'email', placeholder: 'info@school.com', label: 'Email' },
              { key: 'phone', placeholder: '08012345678', label: 'Phone' },
              { key: 'address', placeholder: 'Lagos, Nigeria', label: 'Address' },
              { key: 'subdomain', placeholder: 'greenfield', label: 'Subdomain' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-gray-400 text-sm mb-1 block">{f.label}</label>
                <input
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : schools.length === 0 ? (
          <p className="text-gray-400">No schools yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {schools.map((s) => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{s.email} · {s.phone}</p>
                    <p className="text-gray-500 text-sm">{s.address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 text-xs mt-3">subdomain: {s.subdomain} · plan: {s.subscription_plan}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
