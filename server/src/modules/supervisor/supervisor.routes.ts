import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { analyticsQuerySchema } from "../sessions/sessions.schema.js";
import {
  exportPdf,
  getAnalytics,
  listSessions,
  listWorkers,
} from "./supervisor.controller.js";

export const supervisorRouter = Router();

supervisorRouter.get("/workers", asyncHandler(listWorkers));
supervisorRouter.get("/sessions", asyncHandler(listSessions));
supervisorRouter.get(
  "/analytics",
  validate(analyticsQuerySchema),
  asyncHandler(getAnalytics),
);
supervisorRouter.get("/export.pdf", asyncHandler(exportPdf));
