import type { UserDto } from "./user";

export type WorkerDto = {
  systemId: string;
  status: "pending" | "approved" | "rejected";
  supervisorId: string | null;
  workerRole: string;
  education: string;
  district: string;
  villages: string[];
  consentGiven: boolean;
};

export type LoginRequest = {
  phone: string;
  password: string;
};

export type LoginResponse = {
  user: UserDto;
};

export type RegisterRequest = {
  name: string;
  age: number;
  gender: string;
  phone: string;
  password: string;
  organisation: string;
  workerRole: string;
  education: string;
  district: string;
  villages: string[];
  consentGiven: true;
};

export type RegisterResponse = {
  user: UserDto;
  worker: WorkerDto;
};
