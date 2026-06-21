import { useMemo } from "react";
import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import type { SessionDto, SessionVillageFilter } from "@/types/session";

import { getSessionsColumns } from "./sessions-columns";
import { SessionsTableToolbar } from "./SessionsTableToolbar";

type SessionsDataTableProps = {
  sessions: SessionDto[];
  emptyMessage: string;
  villageFilter: SessionVillageFilter;
  onVillageFilterChange: (value: SessionVillageFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
};

export function SessionsDataTable({
  sessions,
  emptyMessage,
  villageFilter,
  onVillageFilterChange,
  searchQuery,
  onSearchQueryChange,
  rowSelection,
  onRowSelectionChange,
}: SessionsDataTableProps) {
  const columns = useMemo(
    () => getSessionsColumns({ enableSelection: true }),
    [],
  );

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sessions.filter((session) => {
      if (villageFilter !== "all" && session.village !== villageFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        session.sessionId.toLowerCase().includes(query) ||
        session.workerId.toLowerCase().includes(query)
      );
    });
  }, [sessions, villageFilter, searchQuery]);

  return (
    <DataTable
      columns={columns}
      data={filteredSessions}
      emptyMessage={emptyMessage}
      enableRowSelection
      getRowId={(row) => row.sessionId}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      variant="flush"
      layout="sticky"
      toolbar={
        <SessionsTableToolbar
          villageFilter={villageFilter}
          onVillageFilterChange={onVillageFilterChange}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
        />
      }
    />
  );
}
