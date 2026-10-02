import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://edunova-backend-2x7h.onrender.com';

let socket: Socket | null = null;

const token = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

export const getSocket = (): Socket => {
  if (!socket) {
    const s = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
    });
    const rawEmit = s.emit.bind(s);
    (s as any).emit = (event: string, ...args: any[]) => {
      if (event === 'send_message' && args[0] && typeof args[0] === 'object') {
        args[0] = { ...args[0], token: token() };
      }
      return (rawEmit as any)(event, ...args);
    };
    socket = s;
  }
  return socket;
};

export const joinRoom = (userId: number) => {
  const s = getSocket();
  s.emit('join', userId, token());
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
