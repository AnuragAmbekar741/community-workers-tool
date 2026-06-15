import type {
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionResponse,
  ListSessionsResponse,
} from "@/types/session";

import { api } from "./client";

export async function listSessions(): Promise<ListSessionsResponse> {
  const { data } = await api.get<ListSessionsResponse>("/sessions");
  return data;
}

export async function getSession(sessionId: string): Promise<GetSessionResponse> {
  const { data } = await api.get<GetSessionResponse>(`/sessions/${sessionId}`);
  return data;
}

export async function createSession(
  body: CreateSessionRequest,
): Promise<CreateSessionResponse> {
  const { data } = await api.post<CreateSessionResponse>("/sessions", body);
  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/sessions/${sessionId}`);
}
