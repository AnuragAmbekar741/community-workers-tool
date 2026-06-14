import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";

function jwtExpiresInToMs(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number.parseInt(match[1] ?? "0", 10);
  const unit = match[2] ?? "d";

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * (multipliers[unit] ?? 86_400_000);
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api",
    maxAge: jwtExpiresInToMs(env.JWT_EXPIRES_IN),
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(env.AUTH_COOKIE_NAME, token, cookieOptions());
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(env.AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api",
  });
}

export function getTokenFromRequest(req: Request): string | null {
  const cookieToken = req.cookies?.[env.AUTH_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
  }

  return null;
}
