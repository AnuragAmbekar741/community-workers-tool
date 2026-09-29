import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { zRole, type Role } from "../constants/index.js";
import { UnauthorizedError } from "./errors.js";

export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface PasswordResetPayload {
  userId: string;
  purpose: "password-reset";
  passwordVersion: string;
}

const jwtPayloadSchema = z.object({
  userId: z.string(),
  role: zRole,
});

const passwordResetPayloadSchema = z.object({
  userId: z.string(),
  purpose: z.literal("password-reset"),
  passwordVersion: z.string(),
});

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const parsed = jwtPayloadSchema.safeParse(decoded);
    if (!parsed.success) {
      throw new UnauthorizedError("Invalid token");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token expired");
    }
    throw new UnauthorizedError();
  }
}

export function signPasswordResetToken(payload: PasswordResetPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "10m" });
}

export function verifyPasswordResetToken(token: string): PasswordResetPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const parsed = passwordResetPayloadSchema.safeParse(decoded);
    if (!parsed.success) {
      throw new UnauthorizedError("Invalid or expired reset link");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Invalid or expired reset link");
  }
}
