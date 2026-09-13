import type { Socket } from "socket.io";
import { verifyActiveAccessToken } from '../lib/activeSession';

export async function authenticateSocket(
  socket: Socket,
  next: (error?: Error) => void
) {
  const token = socket.handshake.auth?.token;

  if (typeof token !== "string" || !token) {
    return next(new Error("Authentication required"));
  }

  try {
    const user = await verifyActiveAccessToken(token);

    socket.data.user = user;

    next();
  } catch {
    return next(new Error("Invalid token"));
  }
}
