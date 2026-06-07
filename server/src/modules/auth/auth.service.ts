import type { Role } from "../../constants/index.js";
import { UnauthorizedError } from "../../lib/errors.js";
import { signToken } from "../../lib/jwt.js";
import { verifyPassword } from "../../lib/password.js";
import {
  UsersService,
  type PublicUser,
} from "../users/users.service.js";

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export class AuthService {
  constructor(private usersService = new UsersService()) {}

  async login(phone: string, password: string): Promise<LoginResult> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new UnauthorizedError("Invalid phone or password");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid phone or password");
    }

    const token = signToken({
      userId: user.systemId,
      role: user.role as Role,
    });

    const { passwordHash: _, ...publicUser } = user;
    return { token, user: publicUser };
  }

  async getMe(userId: string): Promise<PublicUser> {
    return this.usersService.getPublicProfile(userId);
  }
}
