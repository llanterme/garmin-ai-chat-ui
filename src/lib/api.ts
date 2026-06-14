import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance — credentials (HttpOnly cookies) are sent automatically
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor to handle transparent token refresh via cookies
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url || '';

    // Don't try to refresh for auth endpoints — 401 is expected when not logged in
    const isAuthEndpoint = requestUrl.includes('/auth/me') ||
                           requestUrl.includes('/auth/refresh') ||
                           requestUrl.includes('/auth/login') ||
                           requestUrl.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Refresh uses the HttpOnly refresh_token cookie automatically
        await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry the original request — new access_token cookie is now set
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — redirect to login only if not already on an auth page
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Error handler utility
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Record<string, unknown>>;

    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      // Handle FastAPI validation errors (422)
      if (axiosError.response.status === 422 && data.detail) {
        // If detail is an array of validation errors
        if (Array.isArray(data.detail)) {
          const validationErrors = (data.detail as Array<{ loc?: string[]; msg: string }>)
            .map((err) => {
              const field = err.loc?.join('.') || 'field';
              return `${field}: ${err.msg}`;
            })
            .join(', ');
          return {
            message: validationErrors || 'Validation error',
            code: 'VALIDATION_ERROR',
            details: data.detail,
          };
        }
        // If detail is a string
        return {
          message: String(data.detail),
          code: 'VALIDATION_ERROR',
          details: data,
        };
      }

      // Handle other error responses
      return {
        message: String(data.detail ?? data.message ?? 'An error occurred'),
        code: String(data.code ?? 'UNKNOWN_ERROR'),
        details: data,
      };
    }

    if (axiosError.code === 'NETWORK_ERROR') {
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }

    return {
      message: axiosError.message || 'An error occurred',
      code: 'REQUEST_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

// Generic API call wrapper
export async function apiCall<T>(
  request: Promise<AxiosResponse<T>>
): Promise<ApiResponse<T>> {
  try {
    const response = await request;
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    };
  }
}
