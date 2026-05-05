import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserOut } from '../types/api';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/authService';
import { getMe } from '../services/userService';
import { saveTokens, clearTokens, isLoggedIn } from '../lib/auth';

interface AuthContextType {
  user: UserOut | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to restore user session:', error);
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn()) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    saveTokens(data.access_token, data.refresh_token);
    await fetchUser();
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiRegister(name, email, password);
    saveTokens(data.access_token, data.refresh_token);
    await fetchUser();
  };

  const logout = async () => {
    try {
      if (document.location.pathname !== '/login') {
         await apiLogout().catch(() => {});
      }
    } finally {
      clearTokens();
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
