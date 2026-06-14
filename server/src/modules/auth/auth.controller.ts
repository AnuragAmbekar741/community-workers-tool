import type { Request, Response } from "express";
import { clearAuthCookie, setAuthCookie } from "../../lib/auth-cookie.js";
import { AuthService } from "./auth.service.js";
import type { LoginBody, RegisterBody } from "./auth.schema.js";

const authService = new AuthService();

export async function login(req: Request, res: Response) {
  const body = req.body as LoginBody;
  const result = await authService.login(body);
  setAuthCookie(res, result.token);
  res.status(200).json({ user: result.user });
}

export async function register(req: Request, res: Response) {
  const body = req.body as RegisterBody;
  const result = await authService.register(body);
  res.status(201).json(result);
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.status(200).json({ success: true });
}
