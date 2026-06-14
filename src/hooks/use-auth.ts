import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/auth-api';
import {
  LoginCredentials,
  RegisterCredentials,
  GarminCredentials,
} from '@/types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    garminCredentials,
    isLoading,
    error,
    setUser,
    setAuthenticated,
    setGarminCredentials,
    setLoading,
    setError,
    logout: authLogout,
  } = useAuthStore();

  // Check authentication status via /auth/me — relies on HttpOnly cookie
  const { data: currentUser, refetch: refetchUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        setAuthenticated(true);
        if (response.data.has_garmin_credentials !== undefined) {
          setGarminCredentials({
            hasCredentials: response.data.has_garmin_credentials,
            lastUpdated: response.data.last_garmin_sync || undefined,
          });
        }
        return response.data;
      }
      // 401 or any failure means the user is not logged in — set unauthenticated state
      // and return null instead of throwing so the error doesn't bubble up
      setAuthenticated(false);
      setUser(null);
      return null;
    },
    // Always attempt the check on mount — the cookie determines auth status
    // Never retry on failure — 401 from /auth/me is definitive
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Test Garmin credentials (optional - not automatically called)
  const testGarminCredentials = async () => {
    try {
      const response = await authApi.testGarminCredentials();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to test Garmin credentials');
    } catch (error) {
      console.error('Error testing Garmin credentials:', error);
      throw error;
    }
  };

  // Login mutation — backend sets HttpOnly cookies, no token handling needed
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials);
      if (!response.success) {
        throw new Error(response.error?.message || 'Login failed');
      }
      return response;
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      setLoading(false);
      if (response.success && response.data) {
        // If user data is included in the login response, set it directly
        if (response.data.user) {
          setUser(response.data.user);
        }
        setAuthenticated(true);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: (error: unknown) => {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
    },
  });

  // Register mutation — backend sets HttpOnly cookies, no token handling needed
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await authApi.register(credentials);
      if (!response.success) {
        throw new Error(response.error?.message || 'Registration failed');
      }
      return response;
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      setLoading(false);
      if (response.success && response.data) {
        if (response.data.user) {
          setUser(response.data.user);
        }
        setAuthenticated(true);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: (error: unknown) => {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
    },
  });

  // Logout mutation — calls server to clear HttpOnly cookies
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      authLogout();
      queryClient.clear();
    },
    onError: () => {
      // Even if the server call fails, clear local state
      authLogout();
      queryClient.clear();
    },
  });

  // Garmin credentials mutations
  const setGarminCredentialsMutation = useMutation({
    mutationFn: (credentials: GarminCredentials) =>
      authApi.setGarminCredentials(credentials),
    onSuccess: (response) => {
      if (response.success) {
        setGarminCredentials({ hasCredentials: true, lastUpdated: new Date().toISOString() });
      }
    },
  });

  const updateGarminCredentialsMutation = useMutation({
    mutationFn: (credentials: GarminCredentials) =>
      authApi.updateGarminCredentials(credentials),
    onSuccess: (response) => {
      if (response.success) {
        setGarminCredentials({ hasCredentials: true, lastUpdated: new Date().toISOString() });
      }
    },
  });

  return {
    // State
    user: user || currentUser,
    isAuthenticated,
    garminCredentials,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    error,

    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    refetchUser,

    // Garmin credentials
    setGarminCredentials: setGarminCredentialsMutation.mutate,
    updateGarminCredentials: updateGarminCredentialsMutation.mutate,
    testGarminCredentials,

    // Mutation states
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isGarminLoading:
      setGarminCredentialsMutation.isPending ||
      updateGarminCredentialsMutation.isPending,
  };
};
