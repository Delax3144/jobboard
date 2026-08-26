import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "./auth";

export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next();
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, secret) as AuthUser;
    req.user = payload;
  } catch {
    // Invalid optional token is treated as unauthenticated.
  }

  next();
}