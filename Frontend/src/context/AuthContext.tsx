import { useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import api from '../lib/api';
import { AuthContext } from './useAuth';
import type { User, AuthResult, RegisterInput } from '../types/user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const token = localStorage.getItem('token');
      if (token === 'undefined' || token === 'null') localStorage.removeItem('token');
      else if (token) {
        try {
          const res = await api.get<{ user: User }>('/auth/me');
          if (!cancelled) setUser(res.data.user);
        } catch (error) {
          if (axios.isAxiosError(error) && [401, 404].includes(error.response?.status ?? 0)) {
            localStorage.removeItem('token');
          }
        }
      }
      if (!cancelled) setIsLoading(false);
    }
    void init();
    const expireSession = () => { setUser(null); };
    window.addEventListener('auth_expired', expireSession);
    return () => { cancelled = true; window.removeEventListener('auth_expired', expireSession); };
  }, []);

  const authenticate = useCallback(async (path: string, data: object): Promise<AuthResult> => {
    const res = await api.post<AuthResult>(path, data);
    if (!res.data.requires2FA) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  }, []);
  const login = useCallback((email: string, password: string) =>
    authenticate('/auth/login', { email, password }), [authenticate]);
  const googleLogin = useCallback((credential: string, role?: string) =>
    authenticate('/auth/google', { credential, role }), [authenticate]);
  const githubLogin = useCallback((code: string, role?: string) =>
    authenticate('/auth/github', { code, role }), [authenticate]);
  const register = useCallback(async (data: RegisterInput) => {
    await api.post<{ message: string }>('/auth/register', data);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return <AuthContext.Provider value={{ user, setUser, login, register, googleLogin, githubLogin, logout, isLoading }}>
    {children}
  </AuthContext.Provider>;
}
