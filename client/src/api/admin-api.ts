import type {
  ApproveWorkerResponse,
  ListWorkersResponse,
  WorkerStatusFilter,
} from "@/types/admin";

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
