import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth";

import { api } from "./client";

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", body);
  return data;
}

export async function register(
  body: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", body);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
