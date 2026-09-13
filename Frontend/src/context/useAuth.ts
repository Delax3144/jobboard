import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { User, AuthResult, RegisterInput } from '../types/user';

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterInput) => Promise<void>;
  googleLogin: (credential: string, role?: string) => Promise<AuthResult>;
  githubLogin: (code: string, role?: string) => Promise<AuthResult>;
  logout: () => void;
  isLoading: boolean;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
