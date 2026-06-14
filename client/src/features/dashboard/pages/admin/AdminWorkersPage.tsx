import { useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";

import { DataTablePage } from "@/components/data-table/data-table-page";
import { useAdminWorkers } from "@/hooks/use-admin-workers";
import { isApiError } from "@/lib/api-error";
import type { WorkerStatusFilter } from "@/types/admin";

import { WorkersDataTable } from "./components/WorkersDataTable";

const EMPTY_MESSAGES: Record<WorkerStatusFilter | "all", string> = {
  pending: "No pending workers.",
  all: "No workers found.",
  approved: "No approved workers.",
  rejected: "No rejected workers.",
};

export function AdminWorkersPage() {
  const [statusFilter, setStatusFilter] = useState<WorkerStatusFilter | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const queryStatus = statusFilter === "all" ? undefined : statusFilter;
  const { data, isLoading, isError, error } = useAdminWorkers(queryStatus);

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
      />
    </DataTablePage>
  );
}
