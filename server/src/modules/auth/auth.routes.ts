import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
} from "./auth.controller.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schema.js";

export const authRouter = Router();
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.post("/register", validate(registerSchema), asyncHandler(register));
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword),
);
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(resetPassword),
);
authRouter.post("/logout", asyncHandler(logout));
