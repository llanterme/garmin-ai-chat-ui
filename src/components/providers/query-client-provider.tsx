'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: unknown) => {
              // Don't retry on 401, 403, 404
              const axiosError = error as { response?: { status?: number } };
              if (axiosError?.response?.status === 401 || 
                  axiosError?.response?.status === 403 || 
                  axiosError?.response?.status === 404) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: (failureCount, error: unknown) => {
              // Don't retry on client errors (4xx)
              const axiosError = error as { response?: { status?: number } };
              if (axiosError?.response?.status && 
                  axiosError.response.status >= 400 && 
                  axiosError.response.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}