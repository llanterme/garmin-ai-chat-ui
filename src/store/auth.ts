import { create } from 'zustand';
import { User, AuthTokens, GarminCredentialsStatus } from '@/types';
import { tokenStorage } from '@/lib/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  garminCredentials: GarminCredentialsStatus | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setGarminCredentials: (credentials: GarminCredentialsStatus | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  garminCredentials: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  setTokens: (tokens) => {
    set({ tokens });
    if (tokens) {
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    } else {
      tokenStorage.clearTokens();
    }
  },

  setGarminCredentials: (credentials) => set({ garminCredentials: credentials }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  logout: () => {
    tokenStorage.clearTokens();
    set({
      user: null,
      tokens: null,
      garminCredentials: null,
      error: null,
    });
  },

  initializeAuth: () => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    if (accessToken && refreshToken) {
      set({
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    }
  },
}));