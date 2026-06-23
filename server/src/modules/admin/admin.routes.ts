import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import {
  sessionParamsSchema,
  updateSessionSchema,
} from "../sessions/sessions.schema.js";
import {
  approveWorker,
  assignWorker,
  deleteSession,
  getSession,
  listSessions,
  listWorkers,
  updateSession,
} from "./admin.controller.js";
import { approveWorkerSchema, assignWorkerSchema, listWorkersQuerySchema } from "./admin.schema.js";

export const adminRouter = Router();

adminRouter.get(
  "/workers",
  validate(listWorkersQuerySchema),
  asyncHandler(listWorkers),
);
adminRouter.patch(
  "/workers/:id/approve",
  validate(approveWorkerSchema),
  asyncHandler(approveWorker),
);
adminRouter.patch(
  "/workers/:id/assign",
  validate(assignWorkerSchema),
  asyncHandler(assignWorker),
);
adminRouter.get("/sessions", asyncHandler(listSessions));
adminRouter.get(
  "/sessions/:id",
  validate(sessionParamsSchema),
  asyncHandler(getSession),
);
adminRouter.patch(
  "/sessions/:id",
  validate(updateSessionSchema),
  asyncHandler(updateSession),
);
adminRouter.delete(
  "/sessions/:id",
  validate(sessionParamsSchema),
  asyncHandler(deleteSession),
);
