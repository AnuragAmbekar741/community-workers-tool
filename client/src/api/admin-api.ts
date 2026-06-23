import type {
  ApproveWorkerResponse,
  ListWorkersResponse,
  WorkerStatusFilter,
} from "@/types/admin";
import type { AnalyticsFilters, AnalyticsResponse } from "@/types/analytics";
import type {
  CreateSessionRequest,
  GetSessionResponse,
  ListSessionsResponse,
} from "@/types/session";

import { api } from "./client";

export async function listWorkers(
  status?: WorkerStatusFilter,
): Promise<ListWorkersResponse> {
  const { data } = await api.get<ListWorkersResponse>("/admin/workers", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function approveWorker(
  workerId: string,
  approved: boolean,
): Promise<ApproveWorkerResponse> {
  const { data } = await api.patch<ApproveWorkerResponse>(
    `/admin/workers/${workerId}/approve`,
    { approved },
  );
  return data;
}

export async function listSessions(): Promise<ListSessionsResponse> {
  const { data } = await api.get<ListSessionsResponse>("/admin/sessions");
  return data;
}

export async function getSession(
  sessionId: string,
): Promise<GetSessionResponse> {
  const { data } = await api.get<GetSessionResponse>(
    `/admin/sessions/${sessionId}`,
  );
  return data;
}

export async function updateSession(
  sessionId: string,
  body: CreateSessionRequest,
): Promise<GetSessionResponse> {
  const { data } = await api.patch<GetSessionResponse>(
    `/admin/sessions/${sessionId}`,
    body,
  );
  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/admin/sessions/${sessionId}`);
}

export async function getAnalytics(
  filters: AnalyticsFilters = {},
): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>("/admin/analytics", {
    params: filters,
  });
  return data;
}
