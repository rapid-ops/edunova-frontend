'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { joinRoom, getSocket } from '@/lib/socket';
import api from '@/lib/api';

export default function ParentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    if (user) {
      joinRoom(user.id);
      fetchNotifications();
      const socket = getSocket();
      socket.on('new_notification', (n: any) => {
        setNotifications((prev) => [n, ...prev]);
      });
      return () => { socket.off('new_notification'); };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/${user?.id}`);
      setNotifications(res.data.notifications);
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Parent Portal</h1>
          <p className="text-gray-500 text-xs">Edunova</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.full_name}</span>
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="text-sm text-red-400">Logout</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-400 mb-6">Welcome, <span className="text-white font-medium">{user?.full_name}</span></p>

        <h2 className="font-semibold mb-3">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`bg-gray-900 border rounded-xl p-4 ${n.is_read ? 'border-gray-800' : 'border-blue-500/40'}`}>
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-gray-400 text-sm mt-1">{n.body}</p>
                <p className="text-gray-600 text-xs mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mt-6">
          <button
            onClick={() => router.push('/dashboard/messages')}
            className="w-full bg-gray-900 border border-gray-800 hover:border-blue-500 text-left px-5 py-4 rounded-xl text-sm font-medium transition"
          >
            Message School →
          </button>
        </div>
      </div>
    </div>
  );
}
