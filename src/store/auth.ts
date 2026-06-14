import { create } from 'zustand';
import { User, GarminCredentialsStatus } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  garminCredentials: GarminCredentialsStatus | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setGarminCredentials: (credentials: GarminCredentialsStatus | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  garminCredentials: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

  setGarminCredentials: (credentials) => set({ garminCredentials: credentials }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      garminCredentials: null,
      error: null,
    });
  },
}));
