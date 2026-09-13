import { prisma } from '../prisma';
import { verifyAccessToken } from './authTokens';

export class InvalidSessionError extends Error {}

export async function verifyActiveAccessToken(token: string) {
  let user;
  try { user = verifyAccessToken(token); }
  catch { throw new InvalidSessionError('Invalid token'); }
  const current = await prisma.user.findUnique({
    where: { id: user.id }, select: { tokenVersion: true, role: true },
  });
  if (!current || current.tokenVersion !== user.tokenVersion || current.role !== user.role) {
    throw new InvalidSessionError('Session expired. Please sign in again.');
  }
  return user;
}
