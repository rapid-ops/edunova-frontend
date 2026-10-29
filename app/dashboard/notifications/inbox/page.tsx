'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Bell, Send } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface N { id: number; title: string; body?: string | null; is_read: boolean; created_at: string }
const when = (s: string) => new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(s));
const ring = 'outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export default function NotificationsInbox() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<N[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [canSend, setCanSend] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setFailed(false);
    try { const r = await api.get(`/notifications/${user.id}`); setItems(r.data.notifications || []); } catch { setFailed(true); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'school_admin' || user.role === 'super_admin') { setCanSend(true); return; }
    if (user.role === 'teacher') api.get('/notifications/settings').then((r) => setCanSend(!!r.data.teachers_can_send)).catch(() => {});
  }, [user]);

  const unread = (items || []).filter((n) => !n.is_read).length;

  const readMore = async (n: N) => {
    setOpenId((cur) => (cur === n.id ? null : n.id));
    if (!n.is_read) {
      setItems((p) => (p || []).map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      try { await api.patch(`/notifications/item/${n.id}/read`); window.dispatchEvent(new Event('notifications-read')); } catch {}
    }
  };
  const markAll = async () => {
    if (!user || unread === 0) return;
    try { await api.patch(`/notifications/read/${user.id}`); setItems((p) => (p || []).map((n) => ({ ...n, is_read: true }))); window.dispatchEvent(new Event('notifications-read')); } catch {}
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center gap-2">
        <button type="button" onClick={() => router.back()} aria-label="Go back" className={`flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-blue-50 ${ring}`}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="flex-1 text-xl font-bold text-[#0b1a4a]">Notifications</h1>
        <button type="button" onClick={markAll} disabled={unread === 0} className={`min-h-11 px-2 text-sm font-medium text-blue-600 disabled:text-slate-300 ${ring}`}>Mark all read</button>
      </div>
      {canSend && (
        <Link href="/dashboard/notifications" className={`mb-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 ${ring}`}><Send className="h-4 w-4" />Send a notification</Link>
      )}
      {failed && (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">Could not load your notifications.</p>
          <button type="button" onClick={load} className={`mt-3 min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 ${ring}`}>Try again</button>
        </div>
      )}
      {!failed && items === null && <p className="py-10 text-center text-sm text-slate-500">Loading...</p>}
      {!failed && items && items.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-12 text-center shadow-sm">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Bell className="h-6 w-6" /></span>
          <p className="text-sm font-semibold text-[#0b1a4a]">No notifications yet</p>
          <p className="mt-1 text-sm text-slate-500">New notifications will appear here.</p>
        </div>
      )}
      <ul className="space-y-3">
        {(items || []).map((n) => (
          <li key={n.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${n.is_read ? 'border-slate-100' : 'border-blue-200 bg-blue-50/50'}`}>
            <div className="flex items-start gap-2">
              {!n.is_read && <span aria-label="Unread" className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />}
              <p className="min-w-0 flex-1 break-words text-sm font-semibold text-[#0b1a4a]">{n.title}</p>
            </div>
            {n.body && <p className={`mt-1 whitespace-pre-line break-words text-sm text-slate-600 ${openId === n.id ? '' : 'line-clamp-2'}`}>{n.body}</p>}
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">{when(n.created_at)}</span>
              <button type="button" onClick={() => readMore(n)} aria-expanded={openId === n.id} className={`min-h-11 text-sm font-semibold text-blue-600 ${ring}`}>{openId === n.id ? 'Show less' : 'Read more'}</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
