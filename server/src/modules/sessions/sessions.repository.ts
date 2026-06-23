import { and, desc, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  sessions,
  type NewSession,
  type Session,
} from "../../db/schema/sessions.js";

export interface AnalyticsFilters {
  from?: string;
  to?: string;
  district?: string;
  workerId?: string;
  topic?: string;
  workerMonth?: string;
}

export interface SessionAggregateRow {
  workerId: string;
  topic: string;
  district: string;
  sessionCount: number;
  totalReached: number;
}

export interface MonthlyAggregateRow {
  month: string;
  sessions: number;
  totalReached: number;
  referrals: number;
}

export interface ReachDistributionRow {
  nWomen: number;
  nMen: number;
  nGirls: number;
  nBoys: number;
  nElders: number;
  nOthers: number;
}

export interface WorkerStatsRow {
  workerId: string;
  totalSessions: number;
  totalReach: number;
  totalReferred: number;
  topicsCovered: string[];
  lastSessionLog: string | null;
}

export class SessionsRepository {
  private buildAnalyticsConditions(
    workerIds: string[],
    filters: AnalyticsFilters,
    options?: { includeWorkerMonth?: boolean },
  ): SQL[] {
    const conditions: SQL[] = [inArray(sessions.workerId, workerIds)];

    if (filters.from) {
      conditions.push(gte(sessions.sessionDate, filters.from));
    }

    if (filters.to) {
      conditions.push(lte(sessions.sessionDate, filters.to));
    }

    if (filters.district) {
      conditions.push(eq(sessions.district, filters.district));
    }

    if (filters.workerId) {
      conditions.push(eq(sessions.workerId, filters.workerId));
    }

    if (filters.topic) {
      conditions.push(eq(sessions.topic, filters.topic));
    }

    if (options?.includeWorkerMonth && filters.workerMonth) {
      conditions.push(
        sql`to_char(${sessions.sessionDate}, 'YYYY-MM') = ${filters.workerMonth}`,
      );
    }

    return conditions;
  }

  async getMaxSessionId(): Promise<string | null> {
    const rows = await db
      .select({ sessionId: sessions.sessionId })
      .from(sessions)
      .orderBy(desc(sessions.sessionId))
      .limit(1);
    return rows[0]?.sessionId ?? null;
  }

  async create(data: NewSession): Promise<Session> {
    const rows = await db.insert(sessions).values(data).returning();
    const session = rows[0];
    if (!session) {
      throw new Error("Failed to create session");
    }
    return session;
  }

  async findById(sessionId: string): Promise<Session | null> {
    const rows = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, sessionId))
      .limit(1);
    return rows[0] ?? null;
  }

  async findByWorker(workerId: string): Promise<Session[]> {
    return db
      .select()
      .from(sessions)
      .where(eq(sessions.workerId, workerId))
      .orderBy(desc(sessions.sessionDate), desc(sessions.createdAt));
  }

  async findByWorkerIds(workerIds: string[]): Promise<Session[]> {
    if (workerIds.length === 0) {
      return [];
    }

    return db
      .select()
      .from(sessions)
      .where(inArray(sessions.workerId, workerIds))
      .orderBy(desc(sessions.sessionDate), desc(sessions.createdAt));
  }

  async update(
    sessionId: string,
    data: Omit<NewSession, "sessionId" | "workerId" | "createdAt">,
  ): Promise<Session> {
    const rows = await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.sessionId, sessionId))
      .returning();
    const session = rows[0];
    if (!session) {
      throw new Error("Failed to update session");
    }
    return session;
  }

  async delete(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
  }

  async listAll(): Promise<Session[]> {
    return db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.sessionDate), desc(sessions.createdAt));
  }

  async aggregateByWorkerIds(
    workerIds: string[],
    filters: AnalyticsFilters = {},
  ): Promise<SessionAggregateRow[]> {
    if (workerIds.length === 0) {
      return [];
    }

    const rows = await db
      .select({
        workerId: sessions.workerId,
        topic: sessions.topic,
        district: sessions.district,
        sessionCount: sql<number>`count(*)::int`,
        totalReached: sql<number>`coalesce(sum(${sessions.totalReached}), 0)::int`,
      })
      .from(sessions)
      .where(and(...this.buildAnalyticsConditions(workerIds, filters)))
      .groupBy(sessions.workerId, sessions.topic, sessions.district);

    return rows;
  }

  async aggregateByMonth(
    workerIds: string[],
    filters: AnalyticsFilters = {},
  ): Promise<MonthlyAggregateRow[]> {
    if (workerIds.length === 0) {
      return [];
    }

    const monthExpr = sql<string>`to_char(${sessions.sessionDate}, 'YYYY-MM')`;

    const rows = await db
      .select({
        month: monthExpr,
        sessions: sql<number>`count(*)::int`,
        totalReached: sql<number>`coalesce(sum(${sessions.totalReached}), 0)::int`,
        referrals: sql<number>`coalesce(sum(${sessions.nReferrals}), 0)::int`,
      })
      .from(sessions)
      .where(and(...this.buildAnalyticsConditions(workerIds, filters)))
      .groupBy(monthExpr)
      .orderBy(monthExpr);

    return rows;
  }

  async aggregateByTopic(
    workerIds: string[],
    filters: AnalyticsFilters = {},
  ): Promise<Record<string, number>> {
    if (workerIds.length === 0) {
      return {};
    }

    const rows = await db
      .select({
        topic: sessions.topic,
        sessionCount: sql<number>`count(*)::int`,
      })
      .from(sessions)
      .where(and(...this.buildAnalyticsConditions(workerIds, filters)))
      .groupBy(sessions.topic);

    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.topic] = row.sessionCount;
    }
    return result;
  }

  async aggregateReachDistribution(
    workerIds: string[],
    filters: AnalyticsFilters = {},
  ): Promise<ReachDistributionRow> {
    const empty: ReachDistributionRow = {
      nWomen: 0,
      nMen: 0,
      nGirls: 0,
      nBoys: 0,
      nElders: 0,
      nOthers: 0,
    };

    if (workerIds.length === 0) {
      return empty;
    }

    const rows = await db
      .select({
        nWomen: sql<number>`coalesce(sum(${sessions.nWomen}), 0)::int`,
        nMen: sql<number>`coalesce(sum(${sessions.nMen}), 0)::int`,
        nGirls: sql<number>`coalesce(sum(${sessions.nGirls}), 0)::int`,
        nBoys: sql<number>`coalesce(sum(${sessions.nBoys}), 0)::int`,
        nElders: sql<number>`coalesce(sum(${sessions.nElders}), 0)::int`,
        nOthers: sql<number>`coalesce(sum(${sessions.nOthers}), 0)::int`,
      })
      .from(sessions)
      .where(and(...this.buildAnalyticsConditions(workerIds, filters)));

    return rows[0] ?? empty;
  }

  async countDistinctDistricts(
    workerIds: string[],
    filters: AnalyticsFilters = {},
  ): Promise<number> {
    if (workerIds.length === 0) {
      return 0;
    }

    const rows = await db
      .select({
        count: sql<number>`count(DISTINCT ${sessions.district})::int`,
      })
      .from(sessions)
      .where(and(...this.buildAnalyticsConditions(workerIds, filters)));

    return rows[0]?.count ?? 0;
  }

  async countActiveWorkers(
    workerIds: string[],
    sinceDate: string,
  ): Promise<number> {
    if (workerIds.length === 0) {
      return 0;
    }

    const rows = await db
      .select({
        count: sql<number>`count(DISTINCT ${sessions.workerId})::int`,
      })
      .from(sessions)
      .where(
        and(
          inArray(sessions.workerId, workerIds),
          gte(sessions.sessionDate, sinceDate),
        ),
      );

    return rows[0]?.count ?? 0;
  }

  async findRecentSessions(
    workerIds: string[],
    filters: AnalyticsFilters = {},
    limit = 10,
  ): Promise<Session[]> {
    if (workerIds.length === 0) {
      return [];
    }

    return db
      .select()
      .from(sessions)
      .where(and(...this.buildAnalyticsConditions(workerIds, filters)))
      .orderBy(desc(sessions.sessionDate), desc(sessions.createdAt))
      .limit(limit);
  }

  async aggregateWorkerStats(
    workerIds: string[],
    filters: AnalyticsFilters = {},
  ): Promise<WorkerStatsRow[]> {
    if (workerIds.length === 0) {
      return [];
    }

    const rows = await db
      .select({
        workerId: sessions.workerId,
        totalSessions: sql<number>`count(*)::int`,
        totalReach: sql<number>`coalesce(sum(${sessions.totalReached}), 0)::int`,
        totalReferred: sql<number>`coalesce(sum(${sessions.nReferrals}), 0)::int`,
        topicsCovered: sql<string[]>`array_agg(DISTINCT ${sessions.topic})`,
        lastSessionLog: sql<string | null>`max(${sessions.sessionDate})::text`,
      })
      .from(sessions)
      .where(
        and(
          ...this.buildAnalyticsConditions(workerIds, filters, {
            includeWorkerMonth: true,
          }),
        ),
      )
      .groupBy(sessions.workerId);

    return rows.map((row) => ({
      ...row,
      topicsCovered: row.topicsCovered ?? [],
    }));
  }

  async sumSessionTotals(
    workerIds: string[],
    filters: AnalyticsFilters = {},
  ): Promise<{ totalSessions: number; totalReached: number }> {
    if (workerIds.length === 0) {
      return { totalSessions: 0, totalReached: 0 };
    }

    const rows = await db
      .select({
        totalSessions: sql<number>`count(*)::int`,
        totalReached: sql<number>`coalesce(sum(${sessions.totalReached}), 0)::int`,
      })
      .from(sessions)
      .where(and(...this.buildAnalyticsConditions(workerIds, filters)));

    return rows[0] ?? { totalSessions: 0, totalReached: 0 };
  }
}
