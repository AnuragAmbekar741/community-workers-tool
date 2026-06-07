import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  sessions,
  type NewSession,
  type Session,
} from "../../db/schema/sessions.js";

export interface AnalyticsFilters {
  from?: string;
  to?: string;
}

export interface SessionAggregateRow {
  workerId: string;
  topic: string;
  village: string;
  sessionCount: number;
  totalReached: number;
}

export class SessionsRepository {
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

    const conditions = [inArray(sessions.workerId, workerIds)];

    if (filters.from) {
      conditions.push(gte(sessions.sessionDate, filters.from));
    }

    if (filters.to) {
      conditions.push(lte(sessions.sessionDate, filters.to));
    }

    const rows = await db
      .select({
        workerId: sessions.workerId,
        topic: sessions.topic,
        village: sessions.village,
        sessionCount: sql<number>`count(*)::int`,
        totalReached: sql<number>`coalesce(sum(${sessions.totalReached}), 0)::int`,
      })
      .from(sessions)
      .where(and(...conditions))
      .groupBy(sessions.workerId, sessions.topic, sessions.village);

    return rows;
  }
}
