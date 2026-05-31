import type { Request, Response } from "express";
import { HealthService } from "./health.service.js";

const healthService = new HealthService();

export async function getHealth(_req: Request, res: Response) {
  const status = await healthService.getStatus();
  const httpStatus = status.database === "error" ? 503 : 200;
  res.status(httpStatus).json(status);
}
