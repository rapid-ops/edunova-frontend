'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { getSocket, joinRoom } from '@/lib/socket';
import api from '@/lib/api';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sender_name: string;
  created_at: string;
}

interface User {
  id: number;
  full_name: string;
  role: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    joinRoom(user.id);
    fetchUsers();

    const socket = getSocket();
    socket.on('new_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => { socket.off('new_message'); };
  }, [user]);

  useEffect(() => {
    if (selectedUser && user) fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users/1');
      setUsers(res.data.users.filter((u: User) => u.id !== user?.id));
    } catch (err) {}
  };

  const fetchMessages = async () => {
    if (!user || !selectedUser) return;
    try {
      const res = await api.get(`/messages/${user.id}/${selectedUser.id}`);
      setMessages(res.data.messages);
    } catch (err) {}
  };

  const sendMessage = () => {
    if (!input.trim() || !user || !selectedUser) return;
    const socket = getSocket();
    socket.emit('send_message', {
      sender_id: user.id,
      receiver_id: selectedUser.id,
      school_id: 1,
      content: input.trim(),
    });
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold">Messages</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`w-full text-left px-4 py-4 border-b border-gray-800 hover:bg-gray-900 transition ${selectedUser?.id === u.id ? 'bg-gray-900' : ''}`}
            >
              <p className="font-medium text-sm">{u.full_name}</p>
              <p className="text-gray-500 text-xs capitalize">{u.role}</p>
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              Select a person to message
            </div>
          ) : (
            <>
              <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
                <p className="font-medium">{selectedUser.full_name}</p>
                <p className="text-gray-500 text-xs capitalize">{selectedUser.role}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${m.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}>
                      <p>{m.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-gray-800 p-4 flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm transition"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
