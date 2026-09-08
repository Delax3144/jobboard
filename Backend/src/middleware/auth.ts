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

export function requireRecentAuth(
  maxAgeSeconds = 10 * 60
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const authenticationAge =
      now - req.user.issuedAt;

    if (
      authenticationAge < 0 ||
      authenticationAge > maxAgeSeconds
    ) {
      return res.status(403).json({
        message:
          "Recent authentication required",
      });
    }

    next();
  };
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

export function getAuthenticatedUser(req: Request): AuthUser {
  if (!req.user) {
    throw new Error(
      "Authenticated user is missing after authMiddleware"
    );
  }

  return req.user;
}