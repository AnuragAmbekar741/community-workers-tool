import { boolean, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const workers = pgTable("workers", {
  systemId: varchar("system_id", { length: 32 })
    .primaryKey()
    .references(() => users.systemId),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  supervisorId: varchar("supervisor_id", { length: 32 }).references(
    () => users.systemId,
  ),
  workerRole: varchar("worker_role", { length: 32 }).notNull(),
  education: varchar("education", { length: 32 }).notNull(),
  district: varchar("district", { length: 64 }).notNull(),
  villages: text("villages").array().notNull(),
  consentGiven: boolean("consent_given").notNull(),
});

export type Worker = typeof workers.$inferSelect;
export type NewWorker = typeof workers.$inferInsert;
