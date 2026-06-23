import type { Request, Response } from "express";
import { createWorkersExportPdf } from "../../lib/pdf-export.js";
import { SessionsService } from "../sessions/sessions.service.js";
import type {
  SessionParams,
  UpdateSessionBody,
} from "../sessions/sessions.schema.js";
import type { AnalyticsQuery } from "../sessions/sessions.schema.js";
import { WorkersService } from "../workers/workers.service.js";
import type {
  ApproveWorkerBody,
  ApproveWorkerParams,
  ListWorkersQuery,
} from "./supervisor.schema.js";

const workersService = new WorkersService();
const sessionsService = new SessionsService();

export async function listWorkers(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const { status } = req.query as ListWorkersQuery;
  const result = await workersService.listWorkersForSupervisor(
    supervisorId,
    status,
  );
  res.status(200).json(result);
}

export async function approveWorker(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const { id } = req.params as ApproveWorkerParams;
  const { approved } = req.body as ApproveWorkerBody;
  const worker = await workersService.approveWorkerForSupervisor(
    supervisorId,
    id,
    approved,
  );
  res.status(200).json({ worker });
}

export async function listSessions(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const result = await sessionsService.listForSupervisor(supervisorId);
  res.status(200).json(result);
}

export async function getSession(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const { id } = req.params as SessionParams;
  const result = await sessionsService.getForSupervisorOrg(supervisorId, id);
  res.status(200).json(result);
}

export async function updateSession(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const { id } = req.params as SessionParams;
  const body = req.body as UpdateSessionBody;
  const result = await sessionsService.updateForSupervisorOrg(
    supervisorId,
    id,
    body,
  );
  res.status(200).json(result);
}

export async function deleteSession(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const { id } = req.params as SessionParams;
  await sessionsService.deleteForSupervisorOrg(supervisorId, id);
  res.status(204).send();
}

export async function getAnalytics(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const query = req.query as AnalyticsQuery;
  const result = await sessionsService.getAnalytics(supervisorId, query);
  res.status(200).json(result);
}

export async function exportPdf(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const data = await sessionsService.getExportData(supervisorId);
  const doc = createWorkersExportPdf(data);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="workers-export.pdf"',
  );
  doc.pipe(res);
}
