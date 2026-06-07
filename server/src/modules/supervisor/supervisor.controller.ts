import type { Request, Response } from "express";
import { createWorkersExportPdf } from "../../lib/pdf-export.js";
import { SessionsService } from "../sessions/sessions.service.js";
import type { AnalyticsQuery } from "../sessions/sessions.schema.js";
import { WorkersService } from "../workers/workers.service.js";

const workersService = new WorkersService();
const sessionsService = new SessionsService();

export async function listWorkers(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const result = await workersService.listSupervisorWorkerIds(supervisorId);
  res.status(200).json(result);
}

export async function listSessions(req: Request, res: Response) {
  const supervisorId = req.user!.userId;
  const result = await sessionsService.listForSupervisor(supervisorId);
  res.status(200).json(result);
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
