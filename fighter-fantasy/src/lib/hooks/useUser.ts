'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useUser() {
  const { user, userProfile, loading, error } = useAuth();
  
  return {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin',
    isEmailVerified: user?.emailVerified || false
  };
} 