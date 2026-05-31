import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../lib/errors.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err instanceof ValidationError && err.errors
        ? { errors: err.errors }
        : {}),
    });
  }

  logger.error({ err, method: req.method, url: req.url }, "Unhandled error");

  const message =
    env.NODE_ENV === "production" ? "Internal server error" : err.message;

  return res.status(500).json({ status: "error", message });
}
