'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Trash2, Plus, Copy } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function APIKeysPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [keys, setKeys] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/api-keys');
      setKeys(r.data.api_keys || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const r = await api.post('/api-keys', { name });
      setNewKey(r.data.api_key.key);
      setName('');
      load();
    } catch {}
    setCreating(false);
  };

  const revoke = async (id: number) => {
    if (!confirm('Revoke this key?')) return;
    await api.delete(`/api-keys/${id}`);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm text-blue-600">← Back</button>
        <h1 className="text-lg font-bold text-gray-900">API Keys</h1>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Generate New Key</p>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Key name (e.g. Mobile App)"
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
          <button onClick={create} disabled={creating || !name.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            <Plus size={15} /> Generate Key
          </button>
        </div>

        {newKey && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 mb-2">Copy this key — it won't be shown again:</p>
            <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
              <code className="text-xs text-gray-800 flex-1 break-all">{newKey}</code>
              <button onClick={() => { navigator.clipboard.writeText(newKey); }}>
                <Copy size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {loading ? <p className="text-center text-gray-400 text-sm py-8">Loading...</p> :
            keys.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">No API keys yet.</div> :
            keys.map(k => (
              <div key={k.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{k.name}</p>
                    <p className="text-xs text-gray-400">
                      {k.is_active ? 'Active' : 'Revoked'} •
                      {k.last_used_at ? ` Last used ${new Date(k.last_used_at).toLocaleDateString()}` : ' Never used'}
                    </p>
                  </div>
                </div>
                {k.is_active && (
                  <button onClick={() => revoke(k.id)}>
                    <Trash2 size={15} className="text-red-400" />
                  </button>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
