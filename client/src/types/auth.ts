import type {
  District,
  Education,
  Gender,
  Organisation,
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
  villages: string[];
  consentGiven: boolean;
};

export type LoginRequest =
  | {
      phone: string;
      password: string;
    }
  | {
      systemId: string;
      password: string;
    };

export type LoginResponse = {
  user: UserDto;
  token: string;
};

export type ForgotPasswordRequest = {
  phone: string;
};

export type ForgotPasswordResponse = {
  resetToken: string;
};

export type ResetPasswordRequest = {
  resetToken: string;
  password: string;
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
  villages: string[];
  consentGiven: true;
};

export type RegisterResponse = {
  user: UserDto;
  worker: WorkerDto;
};
