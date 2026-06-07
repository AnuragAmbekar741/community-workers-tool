import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import {
  approveWorker,
  assignWorker,
  listWorkers,
} from "./admin.controller.js";
import { approveWorkerSchema, assignWorkerSchema } from "./admin.schema.js";

export const adminRouter = Router();

adminRouter.get("/workers", asyncHandler(listWorkers));
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
