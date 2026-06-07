import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import type { LoginBody } from "./auth.schema.js";

const authService = new AuthService();

export async function login(req: Request, res: Response) {
  const { phone, password } = req.body as LoginBody;
  const result = await authService.login(phone, password);
  res.status(200).json(result);
}
