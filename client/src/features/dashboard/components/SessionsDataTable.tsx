import { useMemo } from "react";
import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import type { SessionDto, SessionDistrictFilter } from "@/types/session";

import { getSessionsColumns } from "./sessions-columns";
import { SessionsTableToolbar } from "./SessionsTableToolbar";

type SessionsDataTableProps = {
  sessions: SessionDto[];
  emptyMessage: string;
  districtFilter: SessionDistrictFilter;
  onDistrictFilterChange: (value: SessionDistrictFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  onSessionClick?: (sessionId: string) => void;
};

export function SessionsDataTable({
  sessions,
  emptyMessage,
  districtFilter,
  onDistrictFilterChange,
  searchQuery,
  onSearchQueryChange,
  rowSelection,
  onRowSelectionChange,
  onSessionClick,
}: SessionsDataTableProps) {
  const columns = useMemo(
    () => getSessionsColumns({ enableSelection: true, onSessionClick }),
    [onSessionClick],
  );

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sessions.filter((session) => {
      if (districtFilter !== "all" && session.district !== districtFilter) {
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
  }, [sessions, districtFilter, searchQuery]);

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
          districtFilter={districtFilter}
          onDistrictFilterChange={onDistrictFilterChange}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
        />
      }
    />
  );
}
