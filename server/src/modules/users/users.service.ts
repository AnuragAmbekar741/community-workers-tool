import {
  ORGANISATION,
  type Gender,
  type Organisation,
  type Role,
} from "../../constants/index.js";
import type { NewUser, User } from "../../db/schema/users.js";
import { ConflictError, NotFoundError, ValidationError } from "../../lib/errors.js";
import { hashPassword } from "../../lib/password.js";
import { UsersRepository } from "./users.repository.js";

export type PublicUser = Omit<User, "passwordHash">;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}

function isOrganisation(value: string | null | undefined): value is Organisation {
  return (
    value !== null &&
    value !== undefined &&
    (ORGANISATION as readonly string[]).includes(value)
  );
}

export interface CreateUserInput {
  systemId: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  organisation: Organisation | null;
  role: Role;
  password: string;
}

export class UsersService {
  constructor(private repo = new UsersRepository()) {}

  async findById(systemId: string): Promise<PublicUser> {
    const user = await this.repo.findById(systemId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return toPublicUser(user);
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.repo.findByPhone(phone);
  }

  async getPublicProfile(systemId: string): Promise<PublicUser> {
    return this.findById(systemId);
  }

  async createUser(input: CreateUserInput): Promise<PublicUser> {
    this.assertOrganisationRules(input.role, input.organisation);

    const existing = await this.repo.findByPhone(input.phone);
    if (existing) {
      throw new ConflictError("Phone already registered");
    }

    const passwordHash = await hashPassword(input.password);

    const newUser: NewUser = {
      systemId: input.systemId,
      name: input.name,
      age: input.age,
      gender: input.gender,
      phone: input.phone,
      organisation: input.organisation,
      role: input.role,
      passwordHash,
    };

    const user = await this.repo.create(newUser);
    return toPublicUser(user);
  }

  private assertOrganisationRules(
    role: Role,
    organisation: Organisation | null,
  ): void {
    if (role === "admin") {
      if (organisation !== null) {
        throw new ValidationError("Admin must not have an organisation");
      }
      return;
    }

    if (!isOrganisation(organisation)) {
      throw new ValidationError("Organisation is required for this role");
    }
  }
}
