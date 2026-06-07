import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
} from "./sessions.controller.js";
import {
  createSessionSchema,
  sessionParamsSchema,
} from "./sessions.schema.js";

export const sessionsRouter = Router();

sessionsRouter.post(
  "/",
  validate(createSessionSchema),
  asyncHandler(createSession),
);
sessionsRouter.get("/", asyncHandler(listSessions));
sessionsRouter.get(
  "/:id",
  validate(sessionParamsSchema),
  asyncHandler(getSession),
);
sessionsRouter.delete(
  "/:id",
  validate(sessionParamsSchema),
  asyncHandler(deleteSession),
);
