import { ForbiddenError, NotFoundError, ValidationError } from "../../lib/errors.js";
import { nextSessionIdFromMax } from "../../lib/id-generator.js";
import {
  assertSessionDateNotFuture,
  assertTotalReachedNonZero,
  assertVillageInWorkerVillages,
  computeTotalReached,
} from "../../lib/session-validation.js";
import type { Session } from "../../db/schema/sessions.js";
import { UsersRepository } from "../users/users.repository.js";
import { WorkersService } from "../workers/workers.service.js";
import {
  SessionsRepository,
  type AnalyticsFilters,
} from "./sessions.repository.js";
import type { CreateSessionBody, UpdateSessionBody } from "./sessions.schema.js";

export interface SupervisorAnalytics {
  totalSessions: number;
  totalReached: number;
  byTopic: Record<string, number>;
  byVillage: Record<string, number>;
  byWorker: Record<string, { sessions: number; totalReached: number }>;
}

export interface SessionExportWorker {
  systemId: string;
  name: string;
  sessions: Session[];
}

export interface SessionExportData {
  supervisorId: string;
  supervisorName: string;
  organisation: string | null;
  workers: SessionExportWorker[];
}

export class SessionsService {
  constructor(
    private sessionsRepo = new SessionsRepository(),
    private workersService = new WorkersService(),
    private usersRepo = new UsersRepository(),
  ) {}

  async createForWorker(
    workerId: string,
    input: CreateSessionBody,
  ): Promise<Session> {
    const worker = await this.workersService.assertApproved(workerId);
    this.validateSessionInput(input, worker.villages);

    const sessionId = nextSessionIdFromMax(
      await this.sessionsRepo.getMaxSessionId(),
    );
    const totalReached = computeTotalReached(input);

    return this.sessionsRepo.create({
      sessionId,
      workerId,
      sessionDate: input.sessionDate,
      village: input.village,
      topic: input.topic,
      topicOther: input.topic === "other" ? input.topicOther ?? null : null,
      durationMin: input.durationMin,
      nWomen: input.nWomen,
      nMen: input.nMen,
      nGirls: input.nGirls,
      nBoys: input.nBoys,
      nElders: input.nElders,
      nOthers: input.nOthers,
      totalReached,
      keyIssues: input.keyIssues ?? null,
    });
  }

  async listOwn(workerId: string): Promise<{ sessions: Session[] }> {
    const sessions = await this.sessionsRepo.findByWorker(workerId);
    return { sessions };
  }

  async getOwn(workerId: string, sessionId: string): Promise<{ session: Session }> {
    const session = await this.getSessionOrThrow(sessionId);
    this.assertWorkerOwnsSession(workerId, session);
    return { session };
  }

  async deleteOwn(workerId: string, sessionId: string): Promise<void> {
    const session = await this.getSessionOrThrow(sessionId);
    this.assertWorkerOwnsSession(workerId, session);
    await this.sessionsRepo.delete(sessionId);
  }

  async listAll(): Promise<{ sessions: Session[] }> {
    const sessions = await this.sessionsRepo.listAll();
    return { sessions };
  }

  async updateAny(
    sessionId: string,
    input: UpdateSessionBody,
  ): Promise<{ session: Session }> {
    const existing = await this.getSessionOrThrow(sessionId);
    const worker = await this.workersService.findById(existing.workerId);
    this.validateSessionInput(input, worker.villages);

    const totalReached = computeTotalReached(input);
    const session = await this.sessionsRepo.update(sessionId, {
      sessionDate: input.sessionDate,
      village: input.village,
      topic: input.topic,
      topicOther: input.topic === "other" ? input.topicOther ?? null : null,
      durationMin: input.durationMin,
      nWomen: input.nWomen,
      nMen: input.nMen,
      nGirls: input.nGirls,
      nBoys: input.nBoys,
      nElders: input.nElders,
      nOthers: input.nOthers,
      totalReached,
      keyIssues: input.keyIssues ?? null,
    });

    return { session };
  }

  async deleteAny(sessionId: string): Promise<void> {
    await this.getSessionOrThrow(sessionId);
    await this.sessionsRepo.delete(sessionId);
  }

  async listForSupervisor(
    supervisorId: string,
  ): Promise<{ sessions: Session[] }> {
    const workerIds = await this.getSupervisorWorkerIds(supervisorId);
    const sessions = await this.sessionsRepo.findByWorkerIds(workerIds);
    return { sessions };
  }

  async getAnalytics(
    supervisorId: string,
    filters: AnalyticsFilters = {},
  ): Promise<SupervisorAnalytics> {
    const workerIds = await this.getSupervisorWorkerIds(supervisorId);
    const rows = await this.sessionsRepo.aggregateByWorkerIds(workerIds, filters);

    const analytics: SupervisorAnalytics = {
      totalSessions: 0,
      totalReached: 0,
      byTopic: {},
      byVillage: {},
      byWorker: {},
    };

    for (const row of rows) {
      analytics.totalSessions += row.sessionCount;
      analytics.totalReached += row.totalReached;

      analytics.byTopic[row.topic] =
        (analytics.byTopic[row.topic] ?? 0) + row.sessionCount;
      analytics.byVillage[row.village] =
        (analytics.byVillage[row.village] ?? 0) + row.sessionCount;

      const workerStats = analytics.byWorker[row.workerId] ?? {
        sessions: 0,
        totalReached: 0,
      };
      workerStats.sessions += row.sessionCount;
      workerStats.totalReached += row.totalReached;
      analytics.byWorker[row.workerId] = workerStats;
    }

    return analytics;
  }

  async getExportData(supervisorId: string): Promise<SessionExportData> {
    const supervisor = await this.usersRepo.findById(supervisorId);
    if (!supervisor) {
      throw new NotFoundError("Supervisor not found");
    }

    const { workers: workerIds } =
      await this.workersService.listSupervisorWorkerIds(supervisorId);
    const allSessions = await this.sessionsRepo.findByWorkerIds(workerIds);

    const sessionsByWorker = new Map<string, Session[]>();
    for (const session of allSessions) {
      const existing = sessionsByWorker.get(session.workerId) ?? [];
      existing.push(session);
      sessionsByWorker.set(session.workerId, existing);
    }

    const workers: SessionExportWorker[] = [];
    for (const workerId of workerIds) {
      const user = await this.usersRepo.findById(workerId);
      workers.push({
        systemId: workerId,
        name: user?.name ?? workerId,
        sessions: sessionsByWorker.get(workerId) ?? [],
      });
    }

    return {
      supervisorId,
      supervisorName: supervisor.name,
      organisation: supervisor.organisation,
      workers,
    };
  }

  private validateSessionInput(
    input: CreateSessionBody,
    workerVillages: readonly string[],
  ): void {
    assertSessionDateNotFuture(input.sessionDate);
    assertVillageInWorkerVillages(input.village, workerVillages);

    if (input.topic === "other" && !input.topicOther?.trim()) {
      throw new ValidationError("topicOther is required when topic is other");
    }

    const totalReached = computeTotalReached(input);
    assertTotalReachedNonZero(totalReached);
  }

  private async getSessionOrThrow(sessionId: string): Promise<Session> {
    const session = await this.sessionsRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundError("Session not found");
    }
    return session;
  }

  private assertWorkerOwnsSession(workerId: string, session: Session): void {
    if (session.workerId !== workerId) {
      throw new ForbiddenError("You do not have access to this session");
    }
  }

  private async getSupervisorWorkerIds(supervisorId: string): Promise<string[]> {
    const { workers } =
      await this.workersService.listSupervisorWorkerIds(supervisorId);
    return workers;
  }
}
