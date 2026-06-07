import type { Role } from "../constants/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: Role };
    }
  }
}

export {};
