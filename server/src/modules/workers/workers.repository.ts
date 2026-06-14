import { desc, eq } from "drizzle-orm";
import { db, type Db } from "../../db/index.js";
import {
  users,
  type NewUser,
  type User,
} from "../../db/schema/users.js";
import {
  workers,
  type NewWorker,
  type Worker,
} from "../../db/schema/workers.js";
import type { WorkerStatus } from "../../constants/index.js";

type DbOrTx = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];

export class WorkersRepository {
  async getMaxWorkerId(): Promise<string | null> {
    const rows = await db
      .select({ systemId: workers.systemId })
      .from(workers)
      .orderBy(desc(workers.systemId))
      .limit(1);
    return rows[0]?.systemId ?? null;
  }

  async findById(systemId: string): Promise<Worker | null> {
    const rows = await db
      .select()
      .from(workers)
      .where(eq(workers.systemId, systemId))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(data: NewWorker, tx: DbOrTx = db): Promise<Worker> {
    const rows = await tx.insert(workers).values(data).returning();
    const worker = rows[0];
    if (!worker) {
      throw new Error("Failed to create worker");
    }
    return worker;
  }

  async updateStatus(
    systemId: string,
    status: WorkerStatus,
    tx: DbOrTx = db,
  ): Promise<Worker> {
    const rows = await tx
      .update(workers)
      .set({ status })
      .where(eq(workers.systemId, systemId))
      .returning();
    const worker = rows[0];
    if (!worker) {
      throw new Error("Failed to update worker status");
    }
    return worker;
  }

  async assignSupervisor(
    systemId: string,
    supervisorId: string,
    tx: DbOrTx = db,
  ): Promise<Worker> {
    const rows = await tx
      .update(workers)
      .set({ supervisorId })
      .where(eq(workers.systemId, systemId))
      .returning();
    const worker = rows[0];
    if (!worker) {
      throw new Error("Failed to assign supervisor");
    }
    return worker;
  }

  async listAllIds(): Promise<string[]> {
    const rows = await db
      .select({ systemId: workers.systemId })
      .from(workers)
      .orderBy(workers.systemId);
    return rows.map((row) => row.systemId);
  }

  async listAllWithUsers(
    status?: WorkerStatus,
  ): Promise<Array<{ user: User; worker: Worker }>> {
    const conditions = status ? eq(workers.status, status) : undefined;

    const rows = await db
      .select({ user: users, worker: workers })
      .from(workers)
      .innerJoin(users, eq(workers.systemId, users.systemId))
      .where(conditions)
      .orderBy(desc(users.createdAt));

    return rows;
  }

  async listIdsBySupervisor(supervisorId: string): Promise<string[]> {
    const rows = await db
      .select({ systemId: workers.systemId })
      .from(workers)
      .where(eq(workers.supervisorId, supervisorId))
      .orderBy(workers.systemId);
    return rows.map((row) => row.systemId);
  }

  async registerWorkerPair(
    user: NewUser,
    worker: NewWorker,
  ): Promise<{ user: User; worker: Worker }> {
    return db.transaction(async (tx) => {
      const userRows = await tx.insert(users).values(user).returning();
      const userRow = userRows[0];
      if (!userRow) {
        throw new Error("Failed to create user");
      }

      const workerRows = await tx.insert(workers).values(worker).returning();
      const workerRow = workerRows[0];
      if (!workerRow) {
        throw new Error("Failed to create worker");
      }

      return { user: userRow, worker: workerRow };
    });
  }
}
