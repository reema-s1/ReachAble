import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('accessiboard_token'));
  const [email, setEmail] = useState(() => localStorage.getItem('accessiboard_email'));

  const login = useCallback(async (loginEmail, password) => {
    const data = await api.login(loginEmail, password);
    localStorage.setItem('accessiboard_token', data.token);
    localStorage.setItem('accessiboard_email', data.email);
    setToken(data.token);
    setEmail(data.email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessiboard_token');
    localStorage.removeItem('accessiboard_email');
    setToken(null);
    setEmail(null);
  }, []);

  const value = useMemo(
    () => ({ token, email, isAuthenticated: !!token, login, logout }),
    [token, email, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
