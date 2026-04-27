'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '@/lib/api';
import type { User, LoginRequest } from '@/types/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    apiClient.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }, []);

  useEffect(() => {
    // Register auto-logout callback for 401 responses
    apiClient.setOnUnauthorized(() => {
      clearAuth();
    });
  }, [clearAuth]);

  useEffect(() => {
    // On mount: validate stored token against the server
    const initAuth = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const storedToken = localStorage.getItem('auth_token');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Set token in client so the /api/me request is authenticated
      apiClient.setToken(storedToken);

      try {
        const { user: serverUser } = await apiClient.getMe();
        setToken(storedToken);
        setUser(serverUser);
        // Keep localStorage in sync with latest server data
        localStorage.setItem('auth_user', JSON.stringify(serverUser));
      } catch {
        // Token is invalid or expired — clear everything
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [clearAuth]);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.login(credentials);
      setToken(response.token);
      setUser(response.user);
      apiClient.setToken(response.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Error al iniciar sesión');
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      clearAuth();
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const { user: serverUser } = await apiClient.getMe();
      setUser(serverUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(serverUser));
      }
    } catch {
      // Token revoked server-side
      clearAuth();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
