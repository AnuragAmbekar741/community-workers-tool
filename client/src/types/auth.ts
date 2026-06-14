import type {
  District,
  Education,
  Gender,
  Organisation,
  Village,
  WorkerRole,
} from "@/lib/constants";
import type { UserDto } from "./user";

export type WorkerDto = {
  systemId: string;
  status: "pending" | "approved" | "rejected";
  supervisorId: string | null;
  workerRole: WorkerRole;
  education: Education;
  district: District;
  villages: Village[];
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
  gender: Gender;
  phone: string;
  password: string;
  organisation: Organisation;
  workerRole: WorkerRole;
  education: Education;
  district: District;
  villages: Village[];
  consentGiven: true;
};

export type RegisterResponse = {
  user: UserDto;
  worker: WorkerDto;
};
