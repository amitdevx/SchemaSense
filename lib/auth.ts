/**
 * Authentication Utilities
 * Manages JWT tokens and user session
 */

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

export const auth = {
  /**
   * Store token and user after login
   */
  setSession: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Get stored user
   */
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Clear session (logout)
   */
  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};
