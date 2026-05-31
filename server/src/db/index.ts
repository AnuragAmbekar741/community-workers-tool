import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

const poolConfig = {
  max: env.NODE_ENV === "production" ? 10 : 3,
  idle_timeout: 20,
  connect_timeout: 10,
  ...(env.NODE_ENV === "production" && { ssl: "require" as const }),
} satisfies postgres.Options<Record<string, postgres.PostgresType>>;

const client = postgres(env.DATABASE_URL, poolConfig);

export const db = drizzle(client, { schema });
export type Db = typeof db;

export async function closeDb(): Promise<void> {
  await client.end({ timeout: 5 });
}
