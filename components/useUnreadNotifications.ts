'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { joinRoom, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';

// Number of unread notifications. Updates live, on page change, when read in the bell, and every 90 seconds.
export function useUnreadNotifications(): number {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const r = await api.get(`/notifications/${user.id}`);
      const list: { is_read?: boolean }[] = r.data.notifications || [];
      setCount(list.filter((n) => !n.is_read).length);
    } catch {}
  }, [user]);

  useEffect(() => { load(); }, [load, pathname]);

  useEffect(() => {
    if (!user) return;
    const later = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(load, 500); };
    let socket: ReturnType<typeof getSocket> | undefined;
    try { joinRoom(user.id); socket = getSocket(); socket.on('new_notification', later); } catch {}
    window.addEventListener('notifications-read', later);
    const iv = setInterval(load, 90000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      try { socket && socket.off('new_notification', later); } catch {}
      window.removeEventListener('notifications-read', later);
      clearInterval(iv);
    };
  }, [user, load]);

  return count;
}
