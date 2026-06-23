import type { WorkerStatus } from "../../constants/index.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../../lib/errors.js";
import { nextSessionIdFromMax } from "../../lib/id-generator.js";
import {
  assertReferralFields,
  assertSessionDateNotFuture,
  assertTotalReachedNonZero,
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

export interface SupervisorAnalyticsWorkerRow {
  workerId: string;
  district: string;
  totalSessions: number;
  topicsCovered: string[];
  totalReach: number;
  totalReferred: number;
  status: WorkerStatus;
  lastSessionLog: string | null;
}

export interface SupervisorAnalyticsResponse {
  topBox: {
    totalSessions: number;
    totalReached: number;
    activeWorkers: number;
    totalWorkers: number;
    districtsCovered: number;
  };
  reachByMonth: Array<{ month: string; totalReached: number }>;
  sessionsByTopic: Record<string, number>;
  reachDistribution: {
    nWomen: number;
    nMen: number;
    nGirls: number;
    nBoys: number;
    nElders: number;
    nOthers: number;
  };
  sessionsByMonth: Array<{ month: string; sessions: number }>;
  referralsByMonth: Array<{ month: string; referrals: number }>;
  recentSubmissions: Session[];
  workerTable: SupervisorAnalyticsWorkerRow[];
}

/** @deprecated Use SupervisorAnalyticsResponse */
export interface SupervisorAnalytics {
  totalSessions: number;
  totalReached: number;
  byTopic: Record<string, number>;
  byDistrict: Record<string, number>;
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
    await this.workersService.assertApproved(workerId);
    this.validateSessionInput(input);

    const sessionId = nextSessionIdFromMax(
      await this.sessionsRepo.getMaxSessionId(),
    );
    const totalReached = computeTotalReached(input);

    return this.sessionsRepo.create({
      sessionId,
      workerId,
      sessionDate: input.sessionDate,
      district: input.district,
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
      referralsMade: input.referralsMade,
      nReferrals: input.referralsMade ? input.nReferrals : 0,
      referralReason: input.referralsMade
        ? input.referralReason?.trim() ?? null
        : null,
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
    this.validateSessionInput(input);

    const totalReached = computeTotalReached(input);
    const session = await this.sessionsRepo.update(sessionId, {
      sessionDate: input.sessionDate,
      district: input.district,
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
      referralsMade: input.referralsMade,
      nReferrals: input.referralsMade ? input.nReferrals : 0,
      referralReason: input.referralsMade
        ? input.referralReason?.trim() ?? null
        : null,
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
    const workerIds = await this.getSupervisorOrgWorkerIds(supervisorId);
    const sessions = await this.sessionsRepo.findByWorkerIds(workerIds);
    return { sessions };
  }

  async updateForSupervisorOrg(
    supervisorId: string,
    sessionId: string,
    input: UpdateSessionBody,
  ): Promise<{ session: Session }> {
    const session = await this.getSessionOrThrow(sessionId);
    await this.workersService.assertWorkerInSupervisorOrg(
      supervisorId,
      session.workerId,
    );
    return this.updateAny(sessionId, input);
  }

  async deleteForSupervisorOrg(
    supervisorId: string,
    sessionId: string,
  ): Promise<void> {
    const session = await this.getSessionOrThrow(sessionId);
    await this.workersService.assertWorkerInSupervisorOrg(
      supervisorId,
      session.workerId,
    );
    await this.sessionsRepo.delete(sessionId);
  }

  async getForSupervisorOrg(
    supervisorId: string,
    sessionId: string,
  ): Promise<{ session: Session }> {
    const session = await this.getSessionOrThrow(sessionId);
    await this.workersService.assertWorkerInSupervisorOrg(
      supervisorId,
      session.workerId,
    );
    return { session };
  }

  async getAny(sessionId: string): Promise<{ session: Session }> {
    const session = await this.getSessionOrThrow(sessionId);
    return { session };
  }

  async getAnalytics(
    supervisorId: string,
    filters: AnalyticsFilters = {},
  ): Promise<SupervisorAnalyticsResponse> {
    const workerIds = await this.getSupervisorOrgWorkerIds(supervisorId);
    const totalWorkers = workerIds.length;

    const chartFilters: AnalyticsFilters = {
      from: filters.from,
      to: filters.to,
      district: filters.district,
      workerId: filters.workerId,
      topic: filters.topic,
    };

    const workerTableFilters: AnalyticsFilters = {
      ...chartFilters,
      workerMonth: filters.workerMonth,
    };

    const activeSince = new Date();
    activeSince.setDate(activeSince.getDate() - 30);
    const activeSinceStr = activeSince.toISOString().slice(0, 10);

    const [
      totals,
      monthly,
      sessionsByTopic,
      reachDistribution,
      districtsCovered,
      activeWorkers,
      recentSubmissions,
      workerStats,
    ] = await Promise.all([
      this.sessionsRepo.sumSessionTotals(workerIds, chartFilters),
      this.sessionsRepo.aggregateByMonth(workerIds, chartFilters),
      this.sessionsRepo.aggregateByTopic(workerIds, chartFilters),
      this.sessionsRepo.aggregateReachDistribution(workerIds, chartFilters),
      this.sessionsRepo.countDistinctDistricts(workerIds, chartFilters),
      this.sessionsRepo.countActiveWorkers(workerIds, activeSinceStr),
      this.sessionsRepo.findRecentSessions(workerIds, chartFilters, 10),
      this.sessionsRepo.aggregateWorkerStats(workerIds, workerTableFilters),
    ]);

    const statsByWorkerId = new Map(
      workerStats.map((row) => [row.workerId, row]),
    );

    const workerTable: SupervisorAnalyticsWorkerRow[] = await Promise.all(
      workerIds.map(async (workerId) => {
        const worker = await this.workersService.findById(workerId);
        const stats = statsByWorkerId.get(workerId);

        return {
          workerId,
          district: worker.district,
          totalSessions: stats?.totalSessions ?? 0,
          topicsCovered: stats?.topicsCovered ?? [],
          totalReach: stats?.totalReach ?? 0,
          totalReferred: stats?.totalReferred ?? 0,
          status: worker.status as WorkerStatus,
          lastSessionLog: stats?.lastSessionLog ?? null,
        };
      }),
    );

    workerTable.sort((a, b) => a.workerId.localeCompare(b.workerId));

    return {
      topBox: {
        totalSessions: totals.totalSessions,
        totalReached: totals.totalReached,
        activeWorkers,
        totalWorkers,
        districtsCovered,
      },
      reachByMonth: monthly.map((row) => ({
        month: row.month,
        totalReached: row.totalReached,
      })),
      sessionsByTopic,
      reachDistribution,
      sessionsByMonth: monthly.map((row) => ({
        month: row.month,
        sessions: row.sessions,
      })),
      referralsByMonth: monthly.map((row) => ({
        month: row.month,
        referrals: row.referrals,
      })),
      recentSubmissions,
      workerTable,
    };
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

  private validateSessionInput(input: CreateSessionBody): void {
    assertSessionDateNotFuture(input.sessionDate);

    if (input.topic === "other" && !input.topicOther?.trim()) {
      throw new ValidationError("topicOther is required when topic is other");
    }

    const totalReached = computeTotalReached(input);
    assertTotalReachedNonZero(totalReached);
    assertReferralFields(input);
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

  private async getSupervisorOrgWorkerIds(supervisorId: string): Promise<string[]> {
    const { workers } =
      await this.workersService.listSupervisorWorkerIds(supervisorId);
    return workers;
  }
}
