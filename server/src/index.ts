import { sql } from "drizzle-orm";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { closeDb, db } from "./db/index.js";

async function main() {
  await db.execute(sql`SELECT 1`);

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "Server started");
  });

  function shutdown(signal: string) {
    logger.info({ signal }, "Shutting down gracefully");
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.fatal(err, "Failed to start server");
  process.exit(1);
});
