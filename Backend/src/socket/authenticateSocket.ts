import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";
import type { AuthUser } from "../middleware/auth";

export function authenticateSocket(
  socket: Socket,
  next: (error?: Error) => void
) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error("Server configuration error"));
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.id !== "string" ||
      (payload.role !== "candidate" && payload.role !== "employer")
    ) {
      return next(new Error("Invalid token"));
    }

    const user: AuthUser = {
      id: payload.id,
      role: payload.role,
    };

    socket.data.user = user;

    next();
  } catch {
    return next(new Error("Invalid token"));
  }
}