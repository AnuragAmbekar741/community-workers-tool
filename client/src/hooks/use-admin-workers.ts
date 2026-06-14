import { useQuery } from "@tanstack/react-query";

import { listWorkers } from "@/api/admin-api";
import type { WorkerStatusFilter } from "@/types/admin";

export const adminKeys = {
  all: ["admin"] as const,
  workers: (status?: WorkerStatusFilter) =>
    [...adminKeys.all, "workers", status ?? "all"] as const,
};

export function useAdminWorkers(status?: WorkerStatusFilter) {
  return useQuery({
    queryKey: adminKeys.workers(status),
    queryFn: () => listWorkers(status),
  });
}
