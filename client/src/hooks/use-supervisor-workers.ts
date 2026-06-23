import { useQuery } from "@tanstack/react-query";

import { listWorkers } from "@/api/supervisor-api";
import type { WorkerStatusFilter } from "@/types/admin";

export const supervisorKeys = {
  all: ["supervisor"] as const,
  workers: (status?: WorkerStatusFilter) =>
    [...supervisorKeys.all, "workers", status ?? "all"] as const,
  sessions: () => [...supervisorKeys.all, "sessions"] as const,
  session: (id: string) => [...supervisorKeys.all, "sessions", id] as const,
};

export function useSupervisorWorkers(
  status?: WorkerStatusFilter,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: supervisorKeys.workers(status),
    queryFn: () => listWorkers(status),
    enabled: options?.enabled ?? true,
  });
}
