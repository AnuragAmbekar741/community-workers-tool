import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { login } from "./auth.controller.js";
import { loginSchema } from "./auth.schema.js";

export const authRouter = Router();
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
