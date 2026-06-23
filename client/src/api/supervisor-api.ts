import type {
  ApproveWorkerResponse,
  ListWorkersResponse,
  WorkerStatusFilter,
} from "@/types/admin";
import type { AnalyticsFilters, SupervisorAnalyticsResponse } from "@/types/analytics";
import type {
  CreateSessionRequest,
  GetSessionResponse,
  ListSessionsResponse,
} from "@/types/session";

import { api } from "./client";

export async function listWorkers(
  status?: WorkerStatusFilter,
): Promise<ListWorkersResponse> {
  const { data } = await api.get<ListWorkersResponse>("/supervisor/workers", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function approveWorker(
  workerId: string,
  approved: boolean,
): Promise<ApproveWorkerResponse> {
  const { data } = await api.patch<ApproveWorkerResponse>(
    `/supervisor/workers/${workerId}/approve`,
    { approved },
  );
  return data;
}

export async function listSessions(): Promise<ListSessionsResponse> {
  const { data } = await api.get<ListSessionsResponse>("/supervisor/sessions");
  return data;
}

export async function getSession(
  sessionId: string,
): Promise<GetSessionResponse> {
  const { data } = await api.get<GetSessionResponse>(
    `/supervisor/sessions/${sessionId}`,
  );
  return data;
}

export async function updateSession(
  sessionId: string,
  body: CreateSessionRequest,
): Promise<GetSessionResponse> {
  const { data } = await api.patch<GetSessionResponse>(
    `/supervisor/sessions/${sessionId}`,
    body,
  );
  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/supervisor/sessions/${sessionId}`);
}

export async function getAnalytics(
  filters: AnalyticsFilters = {},
): Promise<SupervisorAnalyticsResponse> {
  const { data } = await api.get<SupervisorAnalyticsResponse>(
    "/supervisor/analytics",
    { params: filters },
  );
  return data;
}
