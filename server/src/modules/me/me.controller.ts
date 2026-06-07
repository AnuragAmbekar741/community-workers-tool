import type { Request, Response } from "express";
import { AuthService } from "../auth/auth.service.js";

const authService = new AuthService();

export async function getMe(req: Request, res: Response) {
  const userId = req.user!.userId;
  const user = await authService.getMe(userId);
  res.status(200).json(user);
}
