import type { Request, Response, NextFunction } from "express";
import type { Role } from "../constants/index.js";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";

export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowed.includes(req.user.role)) {
      return next(new ForbiddenError());
    }

    next();
  };
}
