import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../api/auth';
import { clearToken, getStoredToken, storeToken } from '../api/client';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, password: string) => {
    const { accessToken, user } = await loginRequest(email, password);
    storeToken(accessToken);
    setToken(accessToken);
    setUser(user);
  };

  const register = async (email: string, password: string) => {
    const { accessToken, user } = await registerRequest(email, password);
    storeToken(accessToken);
    setToken(accessToken);
    setUser(user);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ token, isAuthenticated: !!token, login, register, logout }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
