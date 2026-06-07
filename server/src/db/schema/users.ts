import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  systemId: varchar("system_id", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 32 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull().unique(),
  organisation: varchar("organisation", { length: 32 }),
  role: varchar("role", { length: 32 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
