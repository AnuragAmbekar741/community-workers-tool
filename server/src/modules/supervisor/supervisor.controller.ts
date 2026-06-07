import type { Request, Response } from "express";
import { WorkersService } from "../workers/workers.service.js";

const workersService = new WorkersService();

export async function listWorkers(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const result = await workersService.listSupervisorWorkerIds(supervisorId);
  res.status(200).json(result);
}
