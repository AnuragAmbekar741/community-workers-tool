import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import {
  sessionParamsSchema,
  updateSessionSchema,
} from "../sessions/sessions.schema.js";
import { analyticsQuerySchema } from "../sessions/sessions.schema.js";
import {
  approveWorker,
  deleteSession,
  exportPdf,
  getAnalytics,
  getSession,
  listSessions,
  listWorkers,
  updateSession,
} from "./supervisor.controller.js";
import {
  approveWorkerSchema,
  listWorkersQuerySchema,
} from "./supervisor.schema.js";

export const supervisorRouter = Router();

supervisorRouter.get(
  "/workers",
  validate(listWorkersQuerySchema),
  asyncHandler(listWorkers),
);
supervisorRouter.patch(
  "/workers/:id/approve",
  validate(approveWorkerSchema),
  asyncHandler(approveWorker),
);
supervisorRouter.get("/sessions", asyncHandler(listSessions));
supervisorRouter.get(
  "/sessions/:id",
  validate(sessionParamsSchema),
  asyncHandler(getSession),
);
supervisorRouter.patch(
  "/sessions/:id",
  validate(updateSessionSchema),
  asyncHandler(updateSession),
);
supervisorRouter.delete(
  "/sessions/:id",
  validate(sessionParamsSchema),
  asyncHandler(deleteSession),
);
supervisorRouter.get(
  "/analytics",
  validate(analyticsQuerySchema),
  asyncHandler(getAnalytics),
);
supervisorRouter.get("/export.pdf", asyncHandler(exportPdf));
