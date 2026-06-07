import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { zRole, type Role } from "../constants/index.js";
import { UnauthorizedError } from "./errors.js";

export interface JwtPayload {
  userId: string;
  role: Role;
}

const jwtPayloadSchema = z.object({
  userId: z.string(),
  role: zRole,
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
