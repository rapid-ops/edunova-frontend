import { create } from 'zustand';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  school_id?: number;
  avatar_url?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string, remember?: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token, remember = true) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (remember) {
      localStorage.removeItem('session_only');
    } else {
      localStorage.setItem('session_only', '1');
      sessionStorage.setItem('session_alive', '1');
    }
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_only');
    set({ user: null, token: null });
  },
  hydrate: () => {
    try {
      if (localStorage.getItem('session_only') === '1' && !sessionStorage.getItem('session_alive')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('session_only');
        return;
      }
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) set({ token, user: JSON.parse(user) });
    } catch {}
  },
}));
