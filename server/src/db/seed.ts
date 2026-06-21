import { env } from "../config/env.js";
import { closeDb } from "./index.js";
import { UsersService } from "../modules/users/users.service.js";

const ADMIN_SYSTEM_ID = "ADMIN";

const SUPERVISOR_SEEDS = [
  {
    systemId: "SUP01",
    name: "BONEPWA Supervisor",
    phone: "70000002",
    organisation: "BONEPWA" as const,
  },
  {
    systemId: "SUP02",
    name: "MAHALAYPEE Supervisor",
    phone: "70000003",
    organisation: "MAHALAYPEE" as const,
  },
];

async function seedUser(
  usersService: UsersService,
  input: {
    systemId: string;
    name: string;
    age: number;
    gender: "prefer_not_to_say";
    phone: string;
    organisation: "BONEPWA" | "MAHALAYPEE" | null;
    role: "admin" | "supervisor";
    password: string;
  },
) {
  const existing = await usersService.findBySystemId(input.systemId);
  if (existing) {
    console.log(`User ${input.systemId} already exists — skipping.`);
    return;
  }

  const user = await usersService.createUser(input);
  console.log(`Seeded ${input.role} user: ${user.systemId} (phone: ${user.phone})`);
}

async function seed() {
  if (env.NODE_ENV === "production") {
    console.error("db:seed must not run in production.");
    process.exit(1);
  }

  const password = process.env.SEED_PASSWORD ?? "password123";
  const usersService = new UsersService();

  await seedUser(usersService, {
    systemId: ADMIN_SYSTEM_ID,
    name: "System Admin",
    age: 35,
    gender: "prefer_not_to_say",
    phone: "70000001",
    organisation: null,
    role: "admin",
    password,
  });

  for (const supervisor of SUPERVISOR_SEEDS) {
    await seedUser(usersService, {
      systemId: supervisor.systemId,
      name: supervisor.name,
      age: 40,
      gender: "prefer_not_to_say",
      phone: supervisor.phone,
      organisation: supervisor.organisation,
      role: "supervisor",
      password,
    });
  }

  console.log("Login with systemId or phone and SEED_PASSWORD.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
