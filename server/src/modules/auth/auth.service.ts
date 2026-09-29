import { createHash, timingSafeEqual } from "node:crypto";
import type { Role } from "../../constants/index.js";
import type { User } from "../../db/schema/users.js";
import {
  ForbiddenError,
  UnauthorizedError,
} from "../../lib/errors.js";
import {
  signPasswordResetToken,
  signToken,
  verifyPasswordResetToken,
} from "../../lib/jwt.js";
import { verifyPassword } from "../../lib/password.js";
import {
  UsersService,
  type PublicUser,
} from "../users/users.service.js";
import {
  WorkersService,
  type RegisterWorkerResult,
  type WorkerProfile,
} from "../workers/workers.service.js";
import type {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
} from "./auth.schema.js";

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export type RegisterResult = RegisterWorkerResult;

export type MeResponse = PublicUser | (PublicUser & { worker: WorkerProfile });

export class AuthService {
  constructor(
    private usersService = new UsersService(),
    private workersService = new WorkersService(),
  ) {}

  async login(input: LoginBody): Promise<LoginResult> {
    const user = await this.resolveUserForLogin(input);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    await this.assertWorkerMayLogin(user);

    const token = signToken({
      userId: user.systemId,
      role: user.role as Role,
    });

    const { passwordHash: _, ...publicUser } = user;
    return { token, user: publicUser };
  }

  async register(body: RegisterBody): Promise<RegisterResult> {
    return this.workersService.registerWorker(body);
  }

  async beginPasswordReset(
    body: ForgotPasswordBody,
  ): Promise<{ resetToken: string }> {
    const user = await this.usersService.findByPhone(body.phone);
    if (!user) {
      throw new UnauthorizedError("No account found with that phone number");
    }

    return {
      resetToken: signPasswordResetToken({
        userId: user.systemId,
        purpose: "password-reset",
        passwordVersion: this.passwordVersion(user.passwordHash),
      }),
    };
  }

  async resetPassword(body: ResetPasswordBody): Promise<void> {
    const payload = verifyPasswordResetToken(body.resetToken);
    const user = await this.usersService.findBySystemId(payload.userId);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired reset link");
    }

    const actualVersion = Buffer.from(this.passwordVersion(user.passwordHash));
    const tokenVersion = Buffer.from(payload.passwordVersion);
    if (
      actualVersion.length !== tokenVersion.length ||
      !timingSafeEqual(actualVersion, tokenVersion)
    ) {
      throw new UnauthorizedError("Invalid or expired reset link");
    }

    await this.usersService.updatePassword(user.systemId, body.password);
  }

  async getMe(userId: string): Promise<MeResponse> {
    const user = await this.usersService.getPublicProfile(userId);
    if (user.role !== "worker") {
      return user;
    }

    const worker = await this.workersService.findById(userId);
    return { ...user, worker };
  }

  private async resolveUserForLogin(
    input: Pick<LoginBody, "phone" | "systemId">,
  ): Promise<User | null> {
    if (input.phone) {
      return this.usersService.findByPhone(input.phone);
    }
    if (input.systemId) {
      return this.usersService.findBySystemId(input.systemId);
    }
    return null;
  }

  private async assertWorkerMayLogin(user: User): Promise<void> {
    if (user.role !== "worker") {
      return;
    }

    const worker = await this.workersService.findById(user.systemId);
    if (worker.status === "pending") {
      throw new ForbiddenError("Account pending admin approval");
    }
    if (worker.status === "rejected") {
      throw new ForbiddenError("Account has been rejected");
    }
  }

  private passwordVersion(passwordHash: string): string {
    return createHash("sha256").update(passwordHash).digest("base64url");
  }
}
