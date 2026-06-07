import { config as loadEnv } from "dotenv";
import path from "node:path";
import { z } from "zod";

const nodeEnv = process.env.NODE_ENV ?? "development";
const envFile = path.resolve(process.cwd(), `.env.${nodeEnv}`);
loadEnv({ path: envFile });
loadEnv();

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().startsWith("postgresql"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((s) => s.split(",").map((o) => o.trim()))
    .pipe(z.array(z.string().url())),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
});

const schema = baseSchema.superRefine((data, ctx) => {
  if (data.NODE_ENV === "production") {
    if (data.LOG_LEVEL === "debug" || data.LOG_LEVEL === "trace") {
      ctx.addIssue({
        code: "custom",
        message: "Do not use debug/trace log level in production",
        path: ["LOG_LEVEL"],
      });
    }
    if (data.CORS_ORIGINS.includes("*")) {
      ctx.addIssue({
        code: "custom",
        message: "Wildcard CORS is not allowed in production",
        path: ["CORS_ORIGINS"],
      });
    }
    const weakSecrets = ["change-me", "dev-only-change-me-use-32-chars-min!!"];
    if (weakSecrets.includes(data.JWT_SECRET)) {
      ctx.addIssue({
        code: "custom",
        message: "JWT_SECRET must not use a default or documented dev placeholder in production",
        path: ["JWT_SECRET"],
      });
    }
  }
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
