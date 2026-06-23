import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const sessions = pgTable("sessions", {
  sessionId: varchar("session_id", { length: 32 }).primaryKey(),
  workerId: varchar("worker_id", { length: 32 })
    .notNull()
    .references(() => users.systemId),
  sessionDate: date("session_date").notNull(),
  district: varchar("district", { length: 64 }).notNull(),
  topic: varchar("topic", { length: 64 }).notNull(),
  topicOther: text("topic_other"),
  durationMin: integer("duration_min").notNull(),
  nWomen: integer("n_women").notNull(),
  nMen: integer("n_men").notNull(),
  nGirls: integer("n_girls").notNull(),
  nBoys: integer("n_boys").notNull(),
  nElders: integer("n_elders").notNull(),
  nOthers: integer("n_others").notNull(),
  totalReached: integer("total_reached").notNull(),
  keyIssues: text("key_issues"),
  referralsMade: boolean("referrals_made").notNull().default(false),
  nReferrals: integer("n_referrals").notNull().default(0),
  referralReason: text("referral_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
