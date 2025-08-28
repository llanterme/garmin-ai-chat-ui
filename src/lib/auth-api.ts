import { apiClient, apiCall } from './api';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  GarminCredentials,
  GarminCredentialsStatus,
  ApiResponse,
} from '@/types';

export const authApi = {
  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    // OAuth2 password flow expects form-urlencoded data
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    return apiCall(
      apiClient.post<AuthResponse>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    );
  },

  async register(credentials: RegisterCredentials & { full_name?: string }): Promise<ApiResponse<AuthResponse>> {
    return apiCall(
      apiClient.post<AuthResponse>('/auth/register', {
        email: credentials.email,
        password: credentials.password,
        full_name: credentials.full_name || credentials.email.split('@')[0]  // Use email prefix as default name
      })
    );
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiCall(
      apiClient.post<{ message: string }>('/auth/logout')
    );
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ access_token: string }>> {
    return apiCall(
      apiClient.post<{ access_token: string }>('/auth/refresh', {
        refresh_token: refreshToken,
      })
    );
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiCall(
      apiClient.get<User>('/auth/me')
    );
  },

  // Test Garmin credentials (POST /auth/garmin-test) - replaces status check
  async testGarminCredentials(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiCall(
      apiClient.post<{ success: boolean; message: string }>('/auth/garmin-test')
    );
  },

  async setGarminCredentials(credentials: GarminCredentials): Promise<ApiResponse<{ message: string }>> {
    return apiCall(
      apiClient.post<{ message: string }>('/auth/garmin-credentials', {
        username: credentials.email,
        password: credentials.password
      })
    );
  },

  // Update Garmin credentials - same as set (backend only has POST)
  async updateGarminCredentials(credentials: GarminCredentials): Promise<ApiResponse<{ message: string }>> {
    return apiCall(
      apiClient.post<{ message: string }>('/auth/garmin-credentials', {
        username: credentials.email,
        password: credentials.password
      })
    );
  },

  // Change password endpoint 
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return apiCall(
      apiClient.post<{ message: string }>('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      })
    );
  },
};