import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api from '../lib/api';

export type UserRole = 'employer' | 'candidate';

interface User { 
  id: string; email: string; role: UserRole;
  username?: string; firstName?: string; lastName?: string;
  phone?: string; avatarUrl?: string; status?: string;
}

type OAuthResult =
  | {
      requires2FA: true;
      challengeToken: string;
    }
  | {
      requires2FA?: false;
      token: string;
      user: User;
    };

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  googleLogin: (credential: string, role?: string) => Promise<OAuthResult>;
  githubLogin: (code: string, role?: string) => Promise<OAuthResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch { logout(); }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const googleLogin = async (
  credential: string,
  role?: string
): Promise<OAuthResult> => {
  const res = await api.post<OAuthResult>("/auth/google", {
    credential,
    role,
  });

  if (!res.data.requires2FA) {
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  }

  return res.data;
};

  const githubLogin = async (
  code: string,
  role?: string
): Promise<OAuthResult> => {
  const res = await api.post<OAuthResult>("/auth/github", {
    code,
    role,
  });

  if (!res.data.requires2FA) {
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  }

  return res.data;
};

  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, googleLogin, githubLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth error");
  return c;
};