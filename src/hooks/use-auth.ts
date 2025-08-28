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
    tokens,
    garminCredentials,
    isLoading,
    error,
    setUser,
    setTokens,
    setGarminCredentials,
    setLoading,
    setError,
    logout: authLogout,
    initializeAuth,
  } = useAuthStore();

  // Get current user query
  const { data: currentUser, refetch: refetchUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to get user');
    },
    enabled: !!tokens?.accessToken,
    retry: false,
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

  // Login mutation
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
        // If user data is provided, set it; otherwise fetch it
        if (response.data.user) {
          setUser(response.data.user);
        }
        setTokens({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: (error: unknown) => {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
    },
  });

  // Register mutation
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
        // If user data is provided, set it; otherwise fetch it
        if (response.data.user) {
          setUser(response.data.user);
        }
        setTokens({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: (error: unknown) => {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
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
        // Mark as having credentials in local state
        setGarminCredentials({ hasCredentials: true, lastUpdated: new Date().toISOString() });
      }
    },
  });

  const updateGarminCredentialsMutation = useMutation({
    mutationFn: (credentials: GarminCredentials) =>
      authApi.updateGarminCredentials(credentials),
    onSuccess: (response) => {
      if (response.success) {
        // Update local state
        setGarminCredentials({ hasCredentials: true, lastUpdated: new Date().toISOString() });
      }
    },
  });

  return {
    // State
    user: user || currentUser,
    tokens,
    garminCredentials,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    error,

    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    initializeAuth,
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