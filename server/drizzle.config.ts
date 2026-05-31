import { config as loadEnv } from "dotenv";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

const nodeEnv = process.env.NODE_ENV ?? "development";
loadEnv({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });
loadEnv();

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
