import { env } from "../config/env.js";
import { closeDb } from "./index.js";
import { UsersService } from "../modules/users/users.service.js";

const ADMIN_SYSTEM_ID = "ADMIN";

async function seed() {
  if (env.NODE_ENV === "production") {
    console.error("db:seed must not run in production.");
    process.exit(1);
  }

  const password = process.env.SEED_PASSWORD ?? "password123";
  const usersService = new UsersService();

  const existing = await usersService.findBySystemId(ADMIN_SYSTEM_ID);
  if (existing) {
    console.log(`Admin user ${ADMIN_SYSTEM_ID} already exists — skipping.`);
    return;
  }

  const admin = await usersService.createUser({
    systemId: ADMIN_SYSTEM_ID,
    name: "System Admin",
    age: 35,
    gender: "prefer_not_to_say",
    phone: "70000001",
    organisation: null,
    role: "admin",
    password,
  });

  console.log(`Seeded admin user: ${admin.systemId} (phone: ${admin.phone})`);
  console.log("Login with systemId ADMIN or phone 70000001 and SEED_PASSWORD.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
