import type { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  type AccessTokenUser,
} from "../lib/authTokens";

export type AuthUser = AccessTokenUser;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Missing Authorization header",
    });
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

export function requireRole(role: AuthUser["role"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
}