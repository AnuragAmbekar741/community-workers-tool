import { useMemo } from "react";
import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import type { AdminWorkerListItem, WorkerStatusFilter } from "@/types/admin";

import { WorkersTableToolbar } from "./WorkersTableToolbar";
import { getWorkersColumns } from "./workers-columns";

type WorkersDataTableProps = {
  workers: AdminWorkerListItem[];
  emptyMessage: string;
  statusFilter: WorkerStatusFilter | "all";
  onStatusFilterChange: (value: WorkerStatusFilter | "all") => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
};

export function WorkersDataTable({
  workers,
  emptyMessage,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  rowSelection,
  onRowSelectionChange,
}: WorkersDataTableProps) {
  const columns = useMemo(
    () => getWorkersColumns({ enableSelection: true }),
    [],
  );

  const filteredWorkers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return workers;
    }

    return workers.filter((item) =>
      item.user.systemId.toLowerCase().includes(query),
    );
  }, [workers, searchQuery]);

  return (
    <DataTable
      columns={columns}
      data={filteredWorkers}
      emptyMessage={emptyMessage}
      enableRowSelection
      getRowId={(row) => row.worker.systemId}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      variant="flush"
      layout="sticky"
      toolbar={
        <WorkersTableToolbar
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
        />
      }
    />
  );
}
