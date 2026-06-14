import type { Request, Response } from "express";
import { SessionsService } from "../sessions/sessions.service.js";
import type {
  SessionParams,
  UpdateSessionBody,
} from "../sessions/sessions.schema.js";
import { WorkersService } from "../workers/workers.service.js";
import type {
  ApproveWorkerBody,
  ApproveWorkerParams,
  AssignWorkerBody,
  AssignWorkerParams,
  ListWorkersQuery,
} from "./admin.schema.js";

const workersService = new WorkersService();
const sessionsService = new SessionsService();

export async function listWorkers(req: Request, res: Response) {
  const { status } = req.query as ListWorkersQuery;
  const result = await workersService.listWorkersForAdmin(status);
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

export async function listSessions(_req: Request, res: Response) {
  const result = await sessionsService.listAll();
  res.status(200).json(result);
}

export async function updateSession(req: Request, res: Response) {
  const { id } = req.params as SessionParams;
  const body = req.body as UpdateSessionBody;
  const result = await sessionsService.updateAny(id, body);
  res.status(200).json(result);
}

export async function deleteSession(req: Request, res: Response) {
  const { id } = req.params as SessionParams;
  await sessionsService.deleteAny(id);
  res.status(204).send();
}
