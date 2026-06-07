import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { getMe } from "./me.controller.js";

export const meRouter = Router();
meRouter.get("/", asyncHandler(getMe));
