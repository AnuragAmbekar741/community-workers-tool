import type { Request, Response } from "express";
import { WorkersService } from "../workers/workers.service.js";
import type {
  ApproveWorkerBody,
  ApproveWorkerParams,
  AssignWorkerBody,
  AssignWorkerParams,
} from "./admin.schema.js";

const workersService = new WorkersService();

export async function listWorkers(_req: Request, res: Response) {
  const result = await workersService.listAllWorkerIds();
  res.status(200).json(result);
}

export async function approveWorker(req: Request, res: Response) {
  const { id } = req.params as ApproveWorkerParams;
  const { approved } = req.body as ApproveWorkerBody;
  const worker = await workersService.approveWorker(id, approved);
  res.status(200).json({ worker });
}

export async function assignWorker(req: Request, res: Response) {
  const { id } = req.params as AssignWorkerParams;
  const { supervisorId } = req.body as AssignWorkerBody;
  const worker = await workersService.assignSupervisor(id, supervisorId);
  res.status(200).json({ worker });
}
