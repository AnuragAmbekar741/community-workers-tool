import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { meRouter } from "../modules/me/me.routes.js";

export const apiRouter = Router();
apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/me", requireAuth, meRouter);
