import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../lib/errors.js";
import { verifyToken } from "../lib/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthorizedError());
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return next(new UnauthorizedError());
  }

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    next(error instanceof UnauthorizedError ? error : new UnauthorizedError());
  }
}
