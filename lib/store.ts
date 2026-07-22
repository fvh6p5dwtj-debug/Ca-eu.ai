import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
