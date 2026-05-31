import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";

export class HealthService {
  async getStatus() {
    let database: "ok" | "error" = "ok";
    try {
      await db.execute(sql`SELECT 1`);
    } catch {
      database = "error";
    }

    return {
      status: database === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      database,
    };
  }
}
