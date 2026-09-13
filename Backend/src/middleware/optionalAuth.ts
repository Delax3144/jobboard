import type { Request, Response, NextFunction } from "express";
import { verifyActiveAccessToken, InvalidSessionError } from '../lib/activeSession';

export async function optionalAuthMiddleware(
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
    req.user = await verifyActiveAccessToken(token);
  } catch (error) {
    if (!(error instanceof InvalidSessionError)) return next(error);
    // Invalid optional token is treated as unauthenticated.
  }

  next();
}
