import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/authTokens";

export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
  } catch {
    // Invalid optional token is treated as unauthenticated.
  }

  next();
}