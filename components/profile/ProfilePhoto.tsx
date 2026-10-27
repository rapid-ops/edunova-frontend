'use client';
import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Avatar from '@/components/admin/Avatar';
import { preparePhoto, PhotoError } from '@/lib/imageprep';

const plain = (e: any): string => {
  if (e instanceof PhotoError) return e.message;
  const s = e?.response?.status;
  if (s === 413) return 'This photo is too big. Choose one under 2 MB.';
  if (s === 429) return 'You changed your photo several times. Please wait a few minutes and try again.';
  if (s === 401) return 'Please sign in again to change your photo.';
  if (e?.response?.data?.error) return e.response.data.error;
  if (!e?.response) return 'We could not reach the server. Check your connection and try again.';
  return 'We could not save your photo right now. Please try again.';
};

export default function ProfilePhoto() {
  const { user, setAuth } = useAuthStore();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!user) return null;

  const keep = (url: string | null) => {
    const token = localStorage.getItem('token');
    if (token) setAuth({ ...user, avatar_url: url || undefined }, token, localStorage.getItem('session_only') !== '1');
  };

  const choose = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true); setMsg(null);
    try {
      const ready = await preparePhoto(f);
      const fd = new FormData();
      fd.append('file', ready);
      const r = await api.post('/profile-photo', fd);
      keep(r.data.avatar_url);
      setMsg({ ok: true, text: 'Your photo has been updated.' });
    } catch (err) { setMsg({ ok: false, text: plain(err) }); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true); setMsg(null);
    try {
      await api.delete('/profile-photo');
      keep(null); setAsking(false);
      setMsg({ ok: true, text: 'Your photo has been removed.' });
    } catch (err) { setMsg({ ok: false, text: plain(err) }); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-4">
        <Avatar name={user.full_name} src={user.avatar_url} size={80} />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user.full_name}</p>
          <p className="text-sm text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
          <p className="text-xs text-gray-500 break-all">{user.email}</p>
        </div>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={choose} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={() => input.current?.click()}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-50">
          <Camera size={16} />{busy ? 'Working...' : user.avatar_url ? 'Change photo' : 'Add photo'}
        </button>
        {user.avatar_url && !asking && (
          <button type="button" disabled={busy} onClick={() => setAsking(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-50 px-4 text-sm font-medium text-red-600 disabled:opacity-50">
            <Trash2 size={16} />Remove photo
          </button>
        )}
        {asking && (
          <span className="inline-flex min-h-11 flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-700">Remove your photo?</span>
            <button type="button" onClick={remove} disabled={busy} className="min-h-11 px-2 font-medium text-red-600">Yes, remove</button>
            <button type="button" onClick={() => setAsking(false)} className="min-h-11 px-2 text-gray-600">Keep it</button>
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500">JPG, PNG or WebP. Photos are made smaller automatically.</p>
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`mt-3 text-sm ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</p>}
    </div>
  );
}
