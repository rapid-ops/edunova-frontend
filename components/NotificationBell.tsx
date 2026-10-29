'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '@/lib/api';
import { joinRoom, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';

interface N { id: number; title: string; body?: string | null; is_read: boolean; created_at: string }

const when = (s: string) =>
  new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(s));

export default function NotificationBell() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<N[]>([]);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tries = useRef(0);
  const loadRef = useRef<() => void>(() => {});

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const r = await api.get(`/notifications/${user.id}`);
      setItems(r.data.notifications || []);
      setFailed(false);
      tries.current = 0;
    } catch {
      setFailed(true);
      if (tries.current < 5) {
        tries.current += 1;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => loadRef.current(), 60000 * tries.current);
      }
    }
  }, [user]);
  loadRef.current = load;

  useEffect(() => {
    if (!user) return;
    load();
    let socket: any;
    const onNew = (n: N) => setItems((p) => [n, ...p]);
    try { joinRoom(user.id); socket = getSocket(); socket.on('new_notification', onNew); } catch {}
    return () => {
      if (timer.current) clearTimeout(timer.current);
      try { socket && socket.off('new_notification', onNew); } catch {}
    };
  }, [user, load]);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const unread = items.filter((n) => !n.is_read).length;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && failed) { tries.current = 0; load(); }
  };

  const readMore = async (n: N) => {
    setOpenId((cur) => (cur === n.id ? null : n.id));
    if (!n.is_read) {
      setItems((p) => p.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      try { await api.patch(`/notifications/item/${n.id}/read`); window.dispatchEvent(new Event('notifications-read')); } catch {}
    }
  };

  const markAll = async () => {
    if (!user || unread === 0) return;
    try { await api.patch(`/notifications/read/${user.id}`); setItems((p) => p.map((n) => ({ ...n, is_read: true }))); window.dispatchEvent(new Event('notifications-read')); } catch {}
  };

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={toggle} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open}
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-600 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="fixed inset-x-4 top-[72px] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-[#0b1a4a]">Notifications</span>
            <button type="button" onClick={markAll} disabled={unread === 0} className="min-h-9 text-xs font-medium text-blue-600 disabled:text-slate-300">Mark all read</button>
          </div>
          {failed && items.length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-500">Notifications will appear here shortly.</p>}
          {!failed && items.length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</p>}
          {items.slice(0, 8).map((n) => (
            <div key={n.id} className={`border-b border-slate-50 px-4 py-3 ${n.is_read ? '' : 'bg-blue-50/50'}`}>
              <p className="text-sm font-medium text-[#0b1a4a]">{n.title}</p>
              {n.body && <p className={`mt-0.5 whitespace-pre-line break-words text-xs text-slate-500 ${openId === n.id ? '' : 'line-clamp-2'}`}>{n.body}</p>}
              <button type="button" onClick={() => readMore(n)} aria-expanded={openId === n.id} className="mt-1 min-h-9 text-xs font-semibold text-blue-600 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{openId === n.id ? 'Show less' : 'Read more'}</button>
              <p className="text-[11px] text-slate-400">{when(n.created_at)}</p>
            </div>
          ))}
          <Link href="/dashboard/notifications/inbox" onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-center text-sm font-medium text-blue-600">View all</Link>
        </div>
      )}
    </div>
  );
}
