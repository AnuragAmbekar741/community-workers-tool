import { useState } from "react";

import { useAdminWorkers } from "@/hooks/use-admin-workers";
import { isApiError } from "@/lib/api-error";
import type { WorkerStatusFilter } from "@/types/admin";

import { WorkerStatusTabs } from "./components/WorkerStatusTabs";
import { WorkersDataTable } from "./components/WorkersDataTable";

const EMPTY_MESSAGES: Record<WorkerStatusFilter | "all", string> = {
  pending: "No pending workers.",
  all: "No workers found.",
  approved: "No approved workers.",
  rejected: "No rejected workers.",
};

export function AdminWorkersPage() {
  const [statusFilter, setStatusFilter] = useState<WorkerStatusFilter | "all">(
    "pending",
  );

  const queryStatus = statusFilter === "all" ? undefined : statusFilter;
  const { data, isLoading, isError, error } = useAdminWorkers(queryStatus);

  const workers = data?.workers ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-base text-muted-foreground">
          Review registrations and approve or reject workers.
        </p>
      </div>

      <WorkerStatusTabs value={statusFilter} onChange={setStatusFilter} />

      {isLoading ? (
        <p className="text-base text-muted-foreground">Loading workers…</p>
      ) : null}

      {isError ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
          role="alert"
        >
          {isApiError(error)
            ? error.message
            : "Could not load workers. Please try again."}
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <WorkersDataTable
          workers={workers}
          emptyMessage={EMPTY_MESSAGES[statusFilter]}
          showActions={statusFilter === "pending" || statusFilter === "all"}
        />
      ) : null}
    </div>
  );
}
