import { Prisma } from "@prisma/client";

export const safeUserSelect = {
  id: true,
  email: true,
  role: true,
  username: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  lastActive: true,
  status: true,
  createdAt: true,
  bio: true,
  skills: true,
  experience: true,
  isTwoFactorEnabled: true,
  isPublic: true,
  showEmail: true,
  soundEnabled: true,
  notificationVolume: true,
  toastsEnabled: true,
  resumeUrl: true,
  location: true,
} satisfies Prisma.UserSelect;

export const applicationCandidateSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  lastActive: true,
} satisfies Prisma.UserSelect;