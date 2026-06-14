import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { login, logout, register } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRouter = Router();
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.post("/register", validate(registerSchema), asyncHandler(register));
authRouter.post("/logout", asyncHandler(logout));
