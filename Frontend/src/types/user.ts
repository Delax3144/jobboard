export type UserRole = 'employer' | 'candidate';
export interface Experience {
  id: number | string; title: string; company: string; period: string; description: string;
}
export interface User {
  id: string; email: string; role: UserRole;
  username?: string; firstName?: string; lastName?: string;
  phone?: string | null; avatarUrl?: string | null; status?: string | null;
  location?: string | null; bio?: string | null; skills?: string | null;
  experience?: Experience[] | null; resumeUrl?: string | null;
  isPublic?: boolean; showEmail?: boolean; soundEnabled?: boolean;
  toastsEnabled?: boolean; notificationVolume?: number; isTwoFactorEnabled?: boolean;
}
export type AuthResult =
  | { requires2FA: true; challengeToken: string }
  | { requires2FA?: false; token: string; user: User };
export interface RegisterInput {
  email: string; password: string; role: UserRole;
  username: string; firstName: string; lastName: string; phone?: string;
}
