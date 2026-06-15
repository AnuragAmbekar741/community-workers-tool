import type { WorkerDto } from "./auth";

export type Role = "worker" | "supervisor" | "admin";

export type UserDto = {
  systemId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  organisation: string | null;
  role: Role;
  createdAt: string;
};

export type WorkerMeResponse = UserDto & { worker: WorkerDto };

export type MeResponse = UserDto | WorkerMeResponse;
