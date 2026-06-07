import type { Request, Response } from "express";
import { SessionsService } from "./sessions.service.js";
import type { CreateSessionBody, SessionParams } from "./sessions.schema.js";

const sessionsService = new SessionsService();

export async function createSession(req: Request, res: Response) {
  const workerId = req.user!.userId;
  const body = req.body as CreateSessionBody;
  const session = await sessionsService.createForWorker(workerId, body);
  res.status(201).json({ session });
}

export async function listSessions(req: Request, res: Response) {
  const workerId = req.user!.userId;
  const result = await sessionsService.listOwn(workerId);
  res.status(200).json(result);
}

export async function getSession(req: Request, res: Response) {
  const workerId = req.user!.userId;
  const { id } = req.params as SessionParams;
  const result = await sessionsService.getOwn(workerId, id);
  res.status(200).json(result);
}

export async function deleteSession(req: Request, res: Response) {
  const workerId = req.user!.userId;
  const { id } = req.params as SessionParams;
  await sessionsService.deleteOwn(workerId, id);
  res.status(204).send();
}
