'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireEmailVerified?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireEmailVerified = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isEmailVerified, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      // Check authentication
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check admin role
      if (requireAdmin && !isAdmin) {
        router.push('/');
        return;
      }

      // Check email verification
      if (requireEmailVerified && !isEmailVerified) {
        router.push('/verify-email');
        return;
      }
    }
  }, [
    loading,
    isAuthenticated,
    isAdmin,
    isEmailVerified,
    requireAuth,
    requireAdmin,
    requireEmailVerified,
    redirectTo,
    router
  ]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Don't render children if requirements aren't met
  if (requireAuth && !isAuthenticated) return null;
  if (requireAdmin && !isAdmin) return null;
  if (requireEmailVerified && !isEmailVerified) return null;

  return <>{children}</>;
} 