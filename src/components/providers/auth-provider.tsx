'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// Routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/'];

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/activities', '/sync', '/chat', '/settings'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, tokens, initializeAuth, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize auth on app load
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Skip redirect logic if still loading
    if (isLoading) return;

    const isPublicRoute = publicRoutes.some(route => pathname === route);
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // If user is not authenticated and trying to access protected route
    if (!tokens && isProtectedRoute) {
      router.push('/auth/login');
      return;
    }

    // If user is authenticated and on auth pages, redirect to dashboard
    if (tokens && pathname.startsWith('/auth')) {
      router.push('/dashboard');
      return;
    }

    // If user is authenticated but on home page, redirect to dashboard
    if (tokens && pathname === '/') {
      router.push('/dashboard');
      return;
    }

    // If user is not authenticated and on home page, redirect to login
    if (!tokens && pathname === '/') {
      router.push('/auth/login');
      return;
    }
  }, [user, tokens, pathname, router, isLoading]);

  return <>{children}</>;
}