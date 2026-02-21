'use client';

import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { auth, User } from '@/lib/auth';

/**
 * Hook to handle authentication
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = auth.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.login(email, password);
      auth.setSession(response.access_token, response.user);
      setUser(response.user);
      return response;
    } catch (err: any) {
      const errorMsg = err?.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.register(name, email, password);
      auth.setSession(response.access_token, response.user);
      setUser(response.user);
      return response;
    } catch (err: any) {
      const errorMsg = err?.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    auth.clearSession();
    setUser(null);
  };

  const isAuthenticated = auth.isAuthenticated();

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };
}
