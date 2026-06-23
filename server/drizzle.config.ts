import { config as loadEnv } from "dotenv";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

const nodeEnv = process.env.NODE_ENV ?? "development";
loadEnv({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });
loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to server/.env.development or server/.env, then run from the server/ directory.",
  );
}

const dbTarget = (() => {
  try {
    const url = new URL(databaseUrl);
    return `${url.hostname}:${url.port || "5432"}${url.pathname}`;
  } catch {
    return "(invalid DATABASE_URL)";
  }
})();

console.log(`Drizzle target database: ${dbTarget}`);

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
