import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import type {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
} from "./auth.schema.js";

const authService = new AuthService();

export async function login(req: Request, res: Response) {
  const body = req.body as LoginBody;
  const result = await authService.login(body);
  res.status(200).json({ user: result.user, token: result.token });
}

export async function register(req: Request, res: Response) {
  const body = req.body as RegisterBody;
  const result = await authService.register(body);
  res.status(201).json(result);
}

export async function logout(_req: Request, res: Response) {
  res.status(200).json({ success: true });
}

export async function forgotPassword(req: Request, res: Response) {
  const result = await authService.beginPasswordReset(
    req.body as ForgotPasswordBody,
  );
  res.status(200).json(result);
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body as ResetPasswordBody);
  res.status(200).json({ success: true });
}
