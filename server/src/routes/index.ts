import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { requireRole } from "../middleware/require-role.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { meRouter } from "../modules/me/me.routes.js";
import { supervisorRouter } from "../modules/supervisor/supervisor.routes.js";

export const apiRouter = Router();
apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/me", requireAuth, meRouter);
apiRouter.use("/admin", requireAuth, requireRole("admin"), adminRouter);
apiRouter.use(
  "/supervisor",
  requireAuth,
  requireRole("supervisor"),
  supervisorRouter,
);
