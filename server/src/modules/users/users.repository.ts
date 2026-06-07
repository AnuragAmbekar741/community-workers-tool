import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  users,
  type NewUser,
  type User,
} from "../../db/schema/users.js";
import type { Role } from "../../constants/index.js";

export class UsersRepository {
  async findById(systemId: string): Promise<User | null> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.systemId, systemId))
      .limit(1);
    return rows[0] ?? null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(data: NewUser): Promise<User> {
    const rows = await db.insert(users).values(data).returning();
    const user = rows[0];
    if (!user) {
      throw new Error("Failed to create user");
    }
    return user;
  }

  async listByRole(role: Role): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role));
  }
}
