'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'broadcast' | 'direct'>('broadcast');
  const [broadcastForm, setBroadcastForm] = useState({ title: '', body: '', type: 'general', send_whatsapp: false });
  const [directForm, setDirectForm] = useState({ user_id: '', title: '', body: '', type: 'general', send_whatsapp: false });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users/1');
      setUsers(res.data.users.filter((u: any) => u.id !== user?.id));
    } catch (err) {}
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/notifications/broadcast', { school_id: 1, ...broadcastForm });
      setSuccess(`Broadcast sent${broadcastForm.send_whatsapp ? ' via app + WhatsApp' : ''}`);
      setBroadcastForm({ title: '', body: '', type: 'general', send_whatsapp: false });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed');
    }
  };

  const handleDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/notifications', { school_id: 1, ...directForm });
      setSuccess(`Notification sent${directForm.send_whatsapp ? ' via app + WhatsApp' : ''}`);
      setDirectForm({ user_id: '', title: '', body: '', type: 'general', send_whatsapp: false });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed');
    }
  };

  const types = ['general', 'assignment', 'fee', 'attendance', 'result', 'announcement'];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition ${checked ? 'bg-green-600' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-900">←</button>
        <h1 className="text-xl font-bold">Send Notifications</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="flex gap-2 mb-6">
          {(['broadcast', 'direct'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-blue-600 text-gray-900' : 'bg-white text-gray-500'}`}
            >
              {t === 'broadcast' ? 'Broadcast to All' : 'Send to Person'}
            </button>
          ))}
        </div>

        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        {tab === 'broadcast' ? (
          <form onSubmit={handleBroadcast} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Type</label>
              <select value={broadcastForm.type} onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none">
                {types.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Title</label>
              <input value={broadcastForm.title} onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Message</label>
              <textarea value={broadcastForm.body} onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })} rows={4} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none resize-none" required />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Also send via WhatsApp</p>
                <p className="text-gray-500 text-xs">Requires phone numbers on user profiles</p>
              </div>
              <Toggle checked={broadcastForm.send_whatsapp} onChange={() => setBroadcastForm({ ...broadcastForm, send_whatsapp: !broadcastForm.send_whatsapp })} />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-gray-900 py-3 rounded-lg text-sm font-medium">Send to All</button>
          </form>
        ) : (
          <form onSubmit={handleDirect} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Send To</label>
              <select value={directForm.user_id} onChange={(e) => setDirectForm({ ...directForm, user_id: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none" required>
                <option value="">Select person</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Type</label>
              <select value={directForm.type} onChange={(e) => setDirectForm({ ...directForm, type: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none">
                {types.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Title</label>
              <input value={directForm.title} onChange={(e) => setDirectForm({ ...directForm, title: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Message</label>
              <textarea value={directForm.body} onChange={(e) => setDirectForm({ ...directForm, body: e.target.value })} rows={4} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none resize-none" required />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Also send via WhatsApp</p>
                <p className="text-gray-500 text-xs">Requires phone number on user profile</p>
              </div>
              <Toggle checked={directForm.send_whatsapp} onChange={() => setDirectForm({ ...directForm, send_whatsapp: !directForm.send_whatsapp })} />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-gray-900 py-3 rounded-lg text-sm font-medium">Send Notification</button>
          </form>
        )}
      </div>
    </div>
  );
}
