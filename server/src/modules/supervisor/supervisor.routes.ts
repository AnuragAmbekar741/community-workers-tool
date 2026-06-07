import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { listWorkers } from "./supervisor.controller.js";

export const supervisorRouter = Router();

supervisorRouter.get("/workers", asyncHandler(listWorkers));
