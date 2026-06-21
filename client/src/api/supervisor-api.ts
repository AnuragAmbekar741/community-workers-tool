import type {
  ApproveWorkerResponse,
  ListWorkersResponse,
  WorkerStatusFilter,
} from "@/types/admin";
import type { ListSessionsResponse } from "@/types/session";

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
