import { useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";

import { DataTablePage } from "@/components/data-table/data-table-page";
import { WorkersDataTable } from "@/features/dashboard/components/WorkersDataTable";
import { useSupervisorWorkers } from "@/hooks/use-supervisor-workers";
import { isApiError } from "@/lib/api-error";
import type { WorkerStatusFilter } from "@/types/admin";

import { SupervisorWorkerStatusSelect } from "./components/SupervisorWorkerStatusSelect";

const EMPTY_MESSAGES: Record<WorkerStatusFilter | "all", string> = {
  pending: "No pending workers in your organisation.",
  all: "No workers found in your organisation.",
  approved: "No approved workers in your organisation.",
  rejected: "No rejected workers in your organisation.",
};

export function SupervisorWorkersPage() {
  const [statusFilter, setStatusFilter] = useState<WorkerStatusFilter | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const queryStatus = statusFilter === "all" ? undefined : statusFilter;
  const { data, isLoading, isError, error } = useSupervisorWorkers(queryStatus);

  const workers = data?.workers ?? [];

  function handleStatusFilterChange(value: WorkerStatusFilter | "all") {
    setStatusFilter(value);
    setRowSelection({});
    setSearchQuery("");
  }

  if (isLoading) {
    return (
      <DataTablePage bleed>
        <p className="px-4 text-base text-muted-foreground md:px-6">
          Loading workers…
        </p>
      </DataTablePage>
    );
  }

  if (isError) {
    return (
      <DataTablePage bleed>
        <div
          className="mx-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive md:mx-6"
          role="alert"
        >
          {isApiError(error)
            ? error.message
            : "Could not load workers. Please try again."}
        </div>
      </DataTablePage>
    );
  }

  return (
    <DataTablePage bleed>
      <WorkersDataTable
        workers={workers}
        emptyMessage={EMPTY_MESSAGES[statusFilter]}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        StatusCell={SupervisorWorkerStatusSelect}
      />
    </DataTablePage>
  );
}
