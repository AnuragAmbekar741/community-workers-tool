import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
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

export async function forgotPassword(
  body: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const { data } = await api.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    body,
  );
  return data;
}

export async function resetPassword(
  body: ResetPasswordRequest,
): Promise<void> {
  await api.post("/auth/reset-password", body);
}
