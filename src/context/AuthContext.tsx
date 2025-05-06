import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, checkAuthStatus, logoutUser } from '../services/authService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'HR' | 'Interviewer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await checkAuthStatus();
        console.log('Auth status check:', userData);
        setUser(userData);
        // Store userId and userRole for notifications
        if (userData) {
          localStorage.setItem('userId', userData.id);
          localStorage.setItem('userRole', userData.role);
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await loginUser(email, password);
      console.log('Login successful:', userData);
      setUser(userData);
      // Store userId and userRole for notifications
      if (userData) {
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userRole', userData.role);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await registerUser(name, email, password, role);
      console.log('Registration successful:', userData);
      setUser(userData);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      // Clear userId and userRole
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};