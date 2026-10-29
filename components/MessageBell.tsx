'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { joinRoom, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';

// Message icon with a red count of unread messages. Updates live and when messages are read.
export default function MessageBell({ href }: { href: string }) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const r = await api.get(`/messages/inbox/${user.id}`);
      const list: { unread_count?: number }[] = r.data.conversations || [];
      setCount(list.reduce((s, c) => s + (c.unread_count || 0), 0));
    } catch {}
  }, [user]);

  useEffect(() => { load(); }, [load, pathname]);

  useEffect(() => {
    if (!user) return;
    const later = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(load, 500); };
    const onMsg = (m: { receiver_id?: number | string }) => { if (Number(m?.receiver_id) === Number(user.id)) later(); };
    let socket: ReturnType<typeof getSocket> | undefined;
    try { joinRoom(user.id); socket = getSocket(); socket.on('new_message', onMsg); } catch {}
    window.addEventListener('messages-read', later);
    const iv = setInterval(load, 90000);
    const vis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', vis);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      try { socket && socket.off('new_message', onMsg); } catch {}
      window.removeEventListener('messages-read', later);
      document.removeEventListener('visibilitychange', vis);
      clearInterval(iv);
    };
  }, [user, load]);

  return (
    <Link href={href} aria-label={`Messages${count ? `, ${count} unread` : ''}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-600 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500">
      <MessageSquare className="h-5 w-5" />
      {count > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{count > 99 ? '99+' : count}</span>}
    </Link>
  );
}
